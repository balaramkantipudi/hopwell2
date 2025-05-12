// components/UserCredits.js
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/libs/supabase';

const UserCredits = () => {
  const [creditsInfo, setCreditsInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Query the user_credits table
        const { data, error } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          // If no record found, create one
          if (error.code === 'PGRST116') {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const resetDate = new Date(currentYear, currentMonth + 1, 1); // First day of next month
            
            // Create a new credits record
            const { data: newRecord, error: insertError } = await supabase
              .from('user_credits')
              .insert([{ 
                user_id: user.id,
                credits_used: 0,
                credits_limit: 30,
                reset_date: resetDate.toISOString()
              }])
              .select();
              
            if (insertError) {
              throw insertError;
            }
            
            setCreditsInfo(newRecord[0]);
          } else {
            throw error;
          }
        } else {
          setCreditsInfo(data);
        }
      } catch (err) {
        console.error('Error fetching credits:', err);
        setError('Failed to load credits information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {error}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (!creditsInfo) {
    return null;
  }

  // Calculate remaining credits
  const remainingCredits = creditsInfo.credits_limit - creditsInfo.credits_used;
  const usagePercentage = (creditsInfo.credits_used / creditsInfo.credits_limit) * 100;
  
  // Format reset date
  const resetDate = new Date(creditsInfo.reset_date);
  const formattedResetDate = resetDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Credits</h3>
      
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">
            {remainingCredits} of {creditsInfo.credits_limit} credits remaining
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(usagePercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              usagePercentage > 85 ? 'bg-red-500' : 
              usagePercentage > 65 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`} 
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>You've used <span className="font-medium">{creditsInfo.credits_used}</span> credits this month.</p>
        <p className="mt-1">Your credits will reset on <span className="font-medium">{formattedResetDate}</span>.</p>
      </div>
      
      <div className="mt-4 p-3 bg-indigo-50 rounded-md">
        <p className="text-sm text-indigo-800">
          Each itinerary generation uses 1 credit. You get 30 credits per month with your free account.
        </p>
      </div>
    </div>
  );
};

export default UserCredits;