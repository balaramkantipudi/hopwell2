// pages/api/auth/session.js
import { supabase } from '@/libs/supabase'

export default async function handler(req, res) {
  // Get session data
  const { data, error } = await supabase.auth.getSession()
  
  if (error) {
    return res.status(401).json({ error: error.message })
  }
  
  return res.status(200).json(data)
}