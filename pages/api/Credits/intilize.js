// pages/api/credits/initialize.js
import { supabase } from '@/libs/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session to verify the user
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = session.user.id;
    
    // Check if the user already has a credit record
    const { data: existingCredits, error: checkError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    // If the record exists, just return it
    if (!checkError && existingCredits) {
      return res.status(200).json(existingCredits);
    }
    
    // Create a new credit record for the user
    const { data: newCredits, error: insertError } = await supabase
      .from('user_credits')
      .insert([
        { 
          user_id: userId,
          credits_remaining: 5, // Start with 5 free credits
          total_credits_used: 0
        }
      ])
      .select();
      
    if (insertError) {
      console.error('Error creating credit record:', insertError);
      return res.status(500).json({ error: insertError.message });
    }
    
    // Return the new credit record
    return res.status(200).json(newCredits[0]);
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
}