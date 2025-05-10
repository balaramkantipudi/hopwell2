// pages/api/auth/signup.js
import { supabase } from '@/libs/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, name } = req.body
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' })
  }

  // Register with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  })
  
  if (error) {
    return res.status(400).json({ error: error.message })
  }
  
  // Create a profile in the profiles table
  if (data?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        name,
        email,
        created_at: new Date().toISOString()
      }])
    
    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Continue anyway as the user is created
    }
  }
  
  return res.status(201).json(data)
}