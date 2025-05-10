// // pages/auth/callback.js
// import { useEffect } from 'react'
// import { useRouter } from 'next/router'
// import { supabase } from '@/libs/supabase'

// export default function AuthCallback() {
//   const router = useRouter()

//   useEffect(() => {
//     const handleAuthCallback = async () => {
//       // Process the callback
//       const { data: { session }, error } = await supabase.auth.getSession()
      
//       if (error) {
//         console.error('Error getting session:', error)
//         router.push('/auth/signin?error=callback_error')
//         return
//       }

//       if (session) {
//         // Successfully authenticated
//         router.push('/dashboard')
//       } else {
//         // No session, redirect to sign in
//         router.push('/auth/signin')
//       }
//     }

//     handleAuthCallback()
//   }, [router])

//   return (
//     <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
//       <p className="ml-3 text-indigo-900">Completing authentication...</p>
//     </div>
//   )
// }

// pages/auth/callback.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/libs/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Process the callback with params from URL
      const { hash, query } = router
      
      // For Auth Code flow - used for email confirmation
      if (query?.code) {
        try {
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(query.code)
          
          if (error) throw error
          
          if (data?.session) {
            // Successfully authenticated
            console.log("Authentication successful")
            router.push('/dashboard')
          } else {
            // No session, redirect to sign in
            router.push('/auth/signin')
          }
        } catch (err) {
          console.error('Auth callback error:', err)
          router.push('/auth/signin?error=callback_error')
        }
      }
      // For implicit flow or other auth methods
      else {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          router.push('/auth/signin?error=callback_error')
          return
        }

        if (session) {
          // Successfully authenticated
          router.push('/dashboard')
        } else {
          // No session, redirect to sign in
          router.push('/auth/signin')
        }
      }
    }

    if (router.isReady) {
      handleAuthCallback()
    }
  }, [router.isReady, router])

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
      <p className="ml-3 text-indigo-900">Completing authentication...</p>
    </div>
  )
}