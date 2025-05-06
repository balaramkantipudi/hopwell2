// pages/api/auth/register.js (updated for Supabase)
import { supabase } from '@/libs/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, password } = req.body

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name,
          created_at: new Date().toISOString()
        }
      }
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Create a profile record in the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: data.user.id,
          name,
          email,
          created_at: new Date().toISOString()
        }
      ])
    
    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Continue anyway since user is created
    }

    return res.status(201).json({ 
      id: data.user.id,
      email: data.user.email
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}