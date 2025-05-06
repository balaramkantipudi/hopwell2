// components/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/libs/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for the auth confirmation in URL
    const handleAuthRedirect = async () => {
      const { hash } = window.location
      if (hash && hash.includes('access_token')) {
        // Supabase can handle the hash as part of its auth flow
        const { data, error } = await supabase.auth.getUser()
        if (data?.user) {
          // Successfully confirmed email, now redirect to dashboard
          router.push('/dashboard')
        }
      }
    }

    handleAuthRedirect()

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        setSession(data.session)
        setUser(data.session?.user || null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event)
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)

        // Handle specific auth events
        if (event === 'SIGNED_IN' && session) {
          // Redirect to dashboard after sign in
          router.push('/dashboard')
        } else if (event === 'SIGNED_OUT') {
          // Redirect to home after sign out
          router.push('/')
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [router])

  // Expose auth methods and state
  const value = {
    user,
    session,
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    },
    signUp: async (email, password, metadata = {}) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { data, error }
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      return { error }
    },
    loading,
    // For compatibility with useSession
    status: loading ? "loading" : user ? "authenticated" : "unauthenticated",
    data: user ? { user, session } : null
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// For backward compatibility with components using useSession
export const useSession = useAuth