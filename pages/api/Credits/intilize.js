// pages/api/credits/initialize.js
import { supabase } from '@/libs/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = session.user.id;
    
    // Check if user already has a credit record
    const { data: existingCredits, error: checkError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    // If record exists, just return it
    if (!checkError && existingCredits) {
      return res.status(200).json({
        success: true,
        credits: {
          credits_remaining: existingCredits.credits_remaining,
          total_credits_used: existingCredits.total_credits_used || 0,
          reset_date: existingCredits.last_credit_reset
        }
      });
    }
    
    // Get the current date for reset tracking
    const now = new Date();
    
    // Create a new credit record for the user
    const { data: newCredits, error: insertError } = await supabase
      .from('user_credits')
      .insert([
        { 
          user_id: userId,
          credits_remaining: 30, // Start with 30 free credits
          total_credits_used: 0,
          last_credit_reset: now.toISOString()
        }
      ])
      .select();
      
    if (insertError) {
      console.error('Error creating credit record:', insertError);
      return res.status(500).json({ 
        success: false,
        error: insertError.message
      });
    }
    
    // Return the new credit record
    return res.status(200).json({
      success: true,
      credits: {
        credits_remaining: newCredits[0].credits_remaining,
        total_credits_used: newCredits[0].total_credits_used || 0,
        reset_date: newCredits[0].last_credit_reset
      }
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
}