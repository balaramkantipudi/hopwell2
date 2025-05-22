// components/UserCreditDisplay.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/libs/supabase';
import Link from 'next/link';
import { getUserCredits } from '@/libs/creditSystem';

export default function UserCreditDisplay() {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextResetDate, setNextResetDate] = useState('');

  useEffect(() => {
    // Don't proceed if user isn't logged in
    if (!user) return;
    
    const fetchCredits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the getUserCredits function from our creditSystem library
        const { success, credits, error } = await getUserCredits(user.id);
        
        if (!success) {
          throw new Error(error || 'Failed to load credits');
        }
        
        setCredits(credits);
        
        // Calculate next reset date (first day of next month)
        const currentDate = new Date();
        const resetDate = credits.reset_date ? new Date(credits.reset_date) : currentDate;
        const nextReset = new Date(resetDate);
        nextReset.setMonth(nextReset.getMonth() + 1);
        nextReset.setDate(1); // First day of next month
        
        setNextResetDate(nextReset.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
      } catch (err) {
        console.error('Error fetching credits:', err);
        setError(err.message);
        
        // Try to fetch directly from the database as fallback
        try {
          const { data, error: supabaseError } = await supabase
            .from('user_credits')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (supabaseError) throw supabaseError;
          
          setCredits({
            credits_remaining: data.credits_remaining || 0,
            total_credits_used: data.total_credits_used || 0,
            reset_date: data.last_credit_reset
          });
          
          // Calculate next reset date
          const resetDate = data.last_credit_reset ? new Date(data.last_credit_reset) : new Date();
          const nextReset = new Date(resetDate);
          nextReset.setMonth(nextReset.getMonth() + 1);
          nextReset.setDate(1);
          
          setNextResetDate(nextReset.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
          
          // Clear the error since we got data from fallback
          setError(null);
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          // Keep the original error
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCredits();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error && !credits) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
        <p className="text-red-700">Error loading credits: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!credits) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <p className="text-yellow-700">No credit information available.</p>
        <Link href="/trip-planner" className="mt-2 text-sm text-yellow-700 underline">
          Start Planning
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-gray-900">Your Credits</h3>
        
        {credits.credits_remaining < 5 && (
          <Link 
            href="/pricing" 
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md transition"
          >
            Get More
          </Link>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600">
            {credits.credits_remaining} of 30 credits remaining
          </span>
          <span className="text-sm font-medium text-gray-500">
            {Math.round((credits.credits_remaining / 30) * 100)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              credits.credits_remaining <= 3 ? 'bg-red-500' : 
              credits.credits_remaining <= 10 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`} 
            style={{ width: `${(credits.credits_remaining / 30) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>You've used <span className="font-medium">{credits.total_credits_used || 0}</span> credits total.</p>
        <p className="mt-1">
          Your credits will reset on <span className="font-medium">{nextResetDate}</span>.
        </p>
      </div>
      
      <div className="mt-4 p-3 bg-indigo-50 rounded-md text-sm text-indigo-800">
        <p>Each itinerary generation uses 1 credit. You get 30 credits per month with your free account.</p>
      </div>
    </div>
  );
}