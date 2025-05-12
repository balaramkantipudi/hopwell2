// libs/userCredits.js

// Functions for managing user credits

/**
 * Check if user has enough credits to generate an itinerary
 * @param {Object} user - User object from Supabase
 * @returns {Object} - Object with hasCredits boolean and remaining credits number
 */
 export const checkUserCredits = async (user, supabase) => {
    if (!user || !user.id) {
      return { hasCredits: false, remaining: 0, error: 'User not authenticated' };
    }
  
    try {
      // Get user's credits from the database
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits_used, credits_limit, reset_date')
        .eq('user_id', user.id)
        .single();
  
      if (error) {
        // If no record exists, create one with default values
        if (error.code === 'PGRST116') {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const resetDate = new Date(currentYear, currentMonth + 1, 1); // First day of next month
          
          const { data: newData, error: insertError } = await supabase
            .from('user_credits')
            .insert([
              {
                user_id: user.id,
                credits_used: 0,
                credits_limit: 30, // Default monthly limit
                reset_date: resetDate.toISOString()
              }
            ])
            .select();
            
          if (insertError) {
            console.error('Error creating user credits:', insertError);
            return { hasCredits: false, remaining: 0, error: 'Failed to create credits record' };
          }
          
          return { hasCredits: true, remaining: 30, isNewUser: true };
        }
        
        console.error('Error getting user credits:', error);
        return { hasCredits: false, remaining: 0, error: 'Failed to check credits' };
      }
      
      // If record exists, check if reset date has passed
      const now = new Date();
      const resetDate = new Date(data.reset_date);
      
      if (now >= resetDate) {
        // Reset credits for new month
        const newResetDate = new Date(resetDate.getFullYear(), resetDate.getMonth() + 1, 1);
        
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({
            credits_used: 0,
            reset_date: newResetDate.toISOString()
          })
          .eq('user_id', user.id);
          
        if (updateError) {
          console.error('Error resetting credits:', updateError);
          return { hasCredits: false, remaining: 0, error: 'Failed to reset credits' };
        }
        
        return { hasCredits: true, remaining: data.credits_limit };
      }
      
      // Check if user has remaining credits
      const remaining = data.credits_limit - data.credits_used;
      return { hasCredits: remaining > 0, remaining };
    } catch (error) {
      console.error('Error in checkUserCredits:', error);
      return { hasCredits: false, remaining: 0, error: 'Unknown error checking credits' };
    }
  };
  
  /**
   * Use one credit for the user
   * @param {Object} user - User object from Supabase
   * @returns {Object} - Object with success boolean and remaining credits number
   */
  export const useCredit = async (user, supabase) => {
    if (!user || !user.id) {
      return { success: false, error: 'User not authenticated' };
    }
  
    try {
      // First check if user has credits
      const { hasCredits, remaining, error } = await checkUserCredits(user, supabase);
      
      if (error) {
        return { success: false, error };
      }
      
      if (!hasCredits) {
        return { success: false, error: 'No credits remaining', remaining: 0 };
      }
      
      // Increment credits used
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          credits_used: supabase.rpc('increment', { x: 1 })
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error('Error using credit:', updateError);
        return { success: false, error: 'Failed to use credit' };
      }
      
      return { success: true, remaining: remaining - 1 };
    } catch (error) {
      console.error('Error in useCredit:', error);
      return { success: false, error: 'Unknown error using credit' };
    }
  };