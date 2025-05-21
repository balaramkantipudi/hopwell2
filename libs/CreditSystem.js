// libs/creditSystem.js

import { supabase } from './supabase';

// Function to check if a user has enough credits
export const checkUserCredits = async (userId, requiredCredits = 1) => {
  try {
    // Fetch the user's current credits from user_credits table
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits, last_credit_reset')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If error is because record doesn't exist, create a new credit record for this user
      if (error.code === 'PGRST116') {
        // Insert new credit record with 30 credits
        const now = new Date();
        const { data: newData, error: insertError } = await supabase
          .from('user_credits')
          .insert([{
            user_id: userId,
            credits: 30,
            last_credit_reset: now.toISOString()
          }])
          .select();
          
        if (insertError) throw insertError;
        
        return {
          hasEnoughCredits: true,
          currentCredits: 30,
          requiredCredits
        };
      } else {
        throw error;
      }
    }
    
    // Check if we need to reset monthly credits
    let currentCredits = data?.credits || 0;
    const lastReset = data?.last_credit_reset ? new Date(data.last_credit_reset) : null;
    const now = new Date();
    
    // If this is the first time or it's been a month since last reset
    const shouldResetCredits = !lastReset || 
      (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear());
    
    if (shouldResetCredits) {
      // Reset to 30 credits at the beginning of each month
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          credits: 30, 
          last_credit_reset: now.toISOString() 
        })
        .eq('user_id', userId);
        
      if (updateError) throw updateError;
      
      currentCredits = 30; // Update local value as well
    }
    
    // Check if user has enough credits
    return {
      hasEnoughCredits: currentCredits >= requiredCredits,
      currentCredits,
      requiredCredits
    };
  } catch (error) {
    console.error('Error checking user credits:', error);
    throw error;
  }
};

// Function to deduct credits from a user
export const deductCredits = async (userId, creditsToDeduct = 1) => {
  try {
    // First check if user has enough credits
    const { hasEnoughCredits, currentCredits } = await checkUserCredits(userId, creditsToDeduct);
    
    if (!hasEnoughCredits) {
      throw new Error('Not enough credits');
    }
    
    // Deduct the credits
    const { data, error } = await supabase
      .from('user_credits')
      .update({ credits: currentCredits - creditsToDeduct })
      .eq('user_id', userId)
      .select();
      
    if (error) throw error;
    
    return {
      success: true,
      newCreditBalance: currentCredits - creditsToDeduct,
      data
    };
  } catch (error) {
    console.error('Error deducting user credits:', error);
    throw error;
  }
};

// Function to add credits to a user
export const addCredits = async (userId, creditsToAdd = 1) => {
  try {
    // Fetch current credits
    const { currentCredits } = await checkUserCredits(userId, 0);
    
    // Add the credits
    const { data, error } = await supabase
      .from('user_credits')
      .update({ credits: currentCredits + creditsToAdd })
      .eq('user_id', userId)
      .select();
      
    if (error) throw error;
    
    return {
      success: true,
      newCreditBalance: currentCredits + creditsToAdd,
      data
    };
  } catch (error) {
    console.error('Error adding user credits:', error);
    throw error;
  }
};