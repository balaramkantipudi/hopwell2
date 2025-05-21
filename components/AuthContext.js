// components/AuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/libs/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
      
      if (session?.user) {
        // If user signed in and on a auth page, redirect to trip-planner
        // instead of dashboard
        if (
          router.pathname === '/auth/signin' || 
          router.pathname === '/auth/signup' ||
          router.pathname === '/dashboard' // Redirect from dashboard too
        ) {
          router.push('/trip-planner');
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Redirect to trip-planner instead of dashboard
      router.push('/trip-planner');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;
      
      // Create user profile after successful signup
      if (data.user) {
        // Get the current date for credit reset tracking
        const now = new Date();
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              full_name: name,
              email: email,
              trips_count: 0,           // Initialize with 0 instead of null
              countries_visited: 0,     // Initialize with 0 instead of null
              credits: 30,              // Give 30 free credits initially
              last_credit_reset: now.toISOString() // Track when credits were last reset
            }
          ]);

        if (profileError) console.error('Error creating profile:', profileError);
      }
      
      // Redirect to trip-planner instead of dashboard
      router.push('/trip-planner');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}