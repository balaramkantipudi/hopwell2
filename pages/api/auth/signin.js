// pages/api/auth/signin.js
import { supabase } from '@/libs/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    return res.status(400).json({ error: error.message })
  }
  
  return res.status(200).json(data)
}