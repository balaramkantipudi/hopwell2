// // libs/supabase.js
// import { createClient } from '@supabase/supabase-js'

// // Create a single supabase client for interacting with your database
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// // Admin client with service role for server-side operations
// export const getServiceSupabase = () => {
//   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
//   return createClient(supabaseUrl, supabaseServiceKey)
// }
// libs/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Make sure we're using cookie storage for better compatibility with API routes
    storage: {
      getItem: (key) => {
        // When running on the server, there is no localStorage
        if (typeof window === 'undefined') {
          return null;
        }
        return JSON.parse(window.localStorage.getItem(key) || 'null');
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      },
    },
  },
})