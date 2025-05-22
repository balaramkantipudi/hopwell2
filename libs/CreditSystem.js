// libs/creditSystem.js
import { supabase } from './supabase';

/**
 * Check if a user has enough credits
 * @param {string} userId - User ID from Supabase
 * @param {number} requiredCredits - Number of credits needed (default: 1)
 * @returns {Promise<Object>} - Information about user's credits
 */
export const checkUserCredits = async (userId, requiredCredits = 1) => {
  if (!userId) {
    return { hasEnoughCredits: false, currentCredits: 0, error: 'User ID is required' };
  }
  
  try {
    // Fetch the user's current credits
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // If no record exists, create one with default values
    if (error && error.code === 'PGRST116') {
      // Create a new record with default credits
      const { data: newData, error: insertError } = await supabase
        .from('user_credits')
        .insert([{
          user_id: userId,
          credits_remaining: 30, // Start with 30 free credits
          total_credits_used: 0,
          last_credit_reset: new Date().toISOString()
        }])
        .select();
      
      if (insertError) {
        console.error('Error creating credit record:', insertError);
        return {
          hasEnoughCredits: false,
          currentCredits: 0,
          error: 'Failed to create credit record'
        };
      }
      
      return {
        hasEnoughCredits: 30 >= requiredCredits,
        currentCredits: 30,
        resetDate: new Date().toISOString()
      };
    }
    
    // Handle other errors
    if (error) {
      console.error('Error fetching credits:', error);
      return {
        hasEnoughCredits: false,
        currentCredits: 0,
        error: 'Failed to check credits'
      };
    }
    
    // Check if credits need to be reset (monthly)
    const lastReset = data.last_credit_reset ? new Date(data.last_credit_reset) : null;
    const now = new Date();
    
    // Reset credits if it's a new month (or never reset before)
    if (!lastReset || 
        lastReset.getMonth() !== now.getMonth() || 
        lastReset.getFullYear() !== now.getFullYear()) {
      
      // Reset to 30 credits at the beginning of each month
      const { data: resetData, error: resetError } = await supabase
        .from('user_credits')
        .update({
          credits_remaining: 30,
          last_credit_reset: now.toISOString()
        })
        .eq('user_id', userId)
        .select();
      
      if (resetError) {
        console.error('Error resetting credits:', resetError);
        return {
          hasEnoughCredits: data.credits_remaining >= requiredCredits,
          currentCredits: data.credits_remaining,
          error: 'Failed to reset monthly credits'
        };
      }
      
      // Return the updated credit information
      return {
        hasEnoughCredits: 30 >= requiredCredits,
        currentCredits: 30,
        resetDate: now.toISOString()
      };
    }
    
    // Otherwise, return current credit status
    return {
      hasEnoughCredits: data.credits_remaining >= requiredCredits,
      currentCredits: data.credits_remaining,
      resetDate: data.last_credit_reset
    };
  } catch (error) {
    console.error('Error in checkUserCredits:', error);
    return {
      hasEnoughCredits: false,
      currentCredits: 0,
      error: error.message || 'Unknown error checking credits'
    };
  }
};

/**
 * Deduct credits from a user
 * @param {string} userId - User ID from Supabase 
 * @param {number} creditsToDeduct - Number of credits to use (default: 1)
 * @returns {Promise<Object>} - Result of the operation
 */
export const deductCredits = async (userId, creditsToDeduct = 1) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }
  
  try {
    // First check if user has enough credits
    const { hasEnoughCredits, currentCredits, error } = await checkUserCredits(userId, creditsToDeduct);
    
    if (error) {
      return { success: false, error };
    }
    
    if (!hasEnoughCredits) {
      return {
        success: false,
        error: 'Not enough credits',
        currentCredits
      };
    }
    
    // Deduct the credits
    const { data, error: updateError } = await supabase
      .from('user_credits')
      .update({
        credits_remaining: currentCredits - creditsToDeduct,
        total_credits_used: supabase.rpc('increment', { x: creditsToDeduct })
      })
      .eq('user_id', userId)
      .select();
    
    if (updateError) {
      console.error('Error deducting credits:', updateError);
      return { success: false, error: 'Failed to deduct credits' };
    }
    
    return {
      success: true,
      newCreditBalance: currentCredits - creditsToDeduct,
      data
    };
  } catch (error) {
    console.error('Error in deductCredits:', error);
    return {
      success: false,
      error: error.message || 'Unknown error deducting credits'
    };
  }
};

/**
 * Add credits to a user
 * @param {string} userId - User ID from Supabase
 * @param {number} creditsToAdd - Number of credits to add
 * @returns {Promise<Object>} - Result of the operation
 */
export const addCredits = async (userId, creditsToAdd = 1) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }
  
  try {
    // Get current credits
    const { currentCredits, error } = await checkUserCredits(userId, 0);
    
    if (error) {
      return { success: false, error };
    }
    
    // Add the credits
    const { data, error: updateError } = await supabase
      .from('user_credits')
      .update({
        credits_remaining: currentCredits + creditsToAdd
      })
      .eq('user_id', userId)
      .select();
    
    if (updateError) {
      console.error('Error adding credits:', updateError);
      return { success: false, error: 'Failed to add credits' };
    }
    
    return {
      success: true,
      newCreditBalance: currentCredits + creditsToAdd,
      data
    };
  } catch (error) {
    console.error('Error in addCredits:', error);
    return {
      success: false,
      error: error.message || 'Unknown error adding credits'
    };
  }
};

/**
 * Get user credits
 * @param {string} userId - User ID from Supabase
 * @returns {Promise<Object>} - User's credit information
 */
export const getUserCredits = async (userId) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }
  
  try {
    const result = await checkUserCredits(userId, 0);
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    return {
      success: true,
      credits: {
        credits_remaining: result.currentCredits,
        total_credits_used: 0, // This would need to be included in the checkUserCredits response
        reset_date: result.resetDate
      }
    };
  } catch (error) {
    console.error('Error in getUserCredits:', error);
    return {
      success: false,
      error: error.message || 'Unknown error getting credits'
    };
  }
};