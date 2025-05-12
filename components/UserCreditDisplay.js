// components/UserCreditDisplay.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/libs/supabase';
import Link from 'next/link';

export default function UserCreditDisplay() {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't proceed if user isn't logged in
    if (!user) return;
    
    const fetchCredits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First, check if a credit record exists
        const { data, error } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          // No record exists yet, we'll create one through our API
          if (error.code === 'PGRST116') { // Record not found
            // Call our API to initialize credits
            const res = await fetch('/api/credits/initialize', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            if (!res.ok) {
              throw new Error('Failed to initialize credits');
            }
            
            const newCredits = await res.json();
            setCredits(newCredits);
          } else {
            throw new Error(`Failed to fetch credits: ${error.message}`);
          }
        } else {
          // Use existing credits
          setCredits(data);
        }
      } catch (err) {
        console.error('Error processing credits:', err);
        setError(err.message);
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

  if (error) {
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
        <p className="text-yellow-700">Loading your credit information...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Your Trip Credits</h3>
        
        {credits.credits_remaining < 2 && (
          <Link 
            href="/pricing" 
            className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded"
          >
            Get More
          </Link>
        )}
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600">Credits remaining</span>
          <span className="font-bold text-lg">{credits.credits_remaining}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              credits.credits_remaining <= 1 ? 'bg-red-600' : 
              credits.credits_remaining <= 3 ? 'bg-yellow-500' : 
              'bg-green-600'
            }`}
            style={{ width: `${Math.min((credits.credits_remaining / 5) * 100, 100)}%` }}
          ></div>
        </div>
        
        <div className="mt-3 text-sm text-gray-500">
          Total itineraries created: {credits.total_credits_used || 0}
        </div>
      </div>
    </div>
  );
}