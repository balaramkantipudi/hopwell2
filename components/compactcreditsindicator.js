// components/CompactCreditsIndicator.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/libs/supabase';
import Link from 'next/link';

export default function CompactCreditsIndicator() {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchCredits = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user credits from Supabase
        const { data, error } = await supabase
          .from('user_credits')
          .select('credits_remaining, total_credits_used')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') { // Record not found
            // Initialize credits via API
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
            throw error;
          }
        } else {
          setCredits(data);
        }
      } catch (err) {
        console.error('Error fetching credits:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCredits();
  }, [user]);

  if (!user || isLoading) {
    return (
      <div className="bg-white shadow rounded-md px-3 py-2 flex items-center">
        <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="ml-2 w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 shadow rounded-md px-3 py-2">
        <span className="text-red-500 text-sm">Error loading credits</span>
      </div>
    );
  }

  if (!credits) return null;

  return (
    <div className="bg-white shadow rounded-md px-3 py-2 flex items-center">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white
        ${credits.credits_remaining <= 1 ? 'bg-red-500' : 
          credits.credits_remaining <= 3 ? 'bg-yellow-500' : 
          'bg-green-500'}`}
      >
        {credits.credits_remaining}
      </div>
      <div className="ml-2 text-sm font-medium">
        <span className="text-gray-800">credits</span>
        
        {credits.credits_remaining <= 1 && (
          <Link href="/pricing" className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline">
            Get more
          </Link>
        )}
      </div>
    </div>
  );
}