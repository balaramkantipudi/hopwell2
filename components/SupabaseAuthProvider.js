// components/SupabaseAuthProvider.js
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/libs/supabase'
import { useRouter } from 'next/router'

const AuthContext = createContext({ user: null, session: null, loading: true })

export function SupabaseAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    }
    
    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Compatibility with useSession from next-auth
  const value = {
    user,
    session,
    loading,
    // Add compatibility with next-auth's signOut
    signOut: () => supabase.auth.signOut(),
    // Add compatibility function to check if user is authenticated
    status: loading ? "loading" : user ? "authenticated" : "unauthenticated",
    // Provide data in a format similar to next-auth
    data: user ? { user, session } : null
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// Legacy compatibility with useSession
export const useSession = useAuth