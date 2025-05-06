// pages/api/auth/signin-handler.js (new file for Supabase authentication)
import { supabase } from '@/libs/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' })
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ 
      user: data.user,
      session: data.session
    })
  } catch (error) {
    console.error('Sign-in error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}