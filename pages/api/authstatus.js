// pages/api/auth-status.js
import { supabase } from '@/libs/supabase';

export default async function handler(req, res) {
  try {
    // Get the user's session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return res.status(500).json({ error: 'Error checking authentication status' });
    }
    
    if (!session) {
      return res.status(200).json({ authenticated: false });
    }
    
    return res.status(200).json({ 
      authenticated: true, 
      user: {
        id: session.user.id,
        email: session.user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error checking authentication' });
  }
}