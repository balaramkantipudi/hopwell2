// components/UserCreditStatus.js
import { useState, useEffect } from 'react';
import { getUserCredits } from '@/utils/creditSystem';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function UserCreditStatus() {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { success, credits, error } = await getUserCredits(user.id);
        
        if (!success) {
          throw new Error(error || 'Failed to load credits');
        }
        
        setCredits(credits);
      } catch (err) {
        console.error('Error fetching credits:', err);
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
      </div>
    );
  }

  if (!credits) {
    return null;
  }

  const { credits_remaining, total_credits_used } = credits;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Your Trip Credits</h3>
        
        {credits_remaining < 2 && (
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
          <span className="font-bold text-lg">{credits_remaining}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              credits_remaining <= 1 ? 'bg-red-600' : 
              credits_remaining <= 3 ? 'bg-yellow-500' : 
              'bg-green-600'
            }`}
            style={{ width: `${Math.min((credits_remaining / 5) * 100, 100)}%` }}
          ></div>
        </div>
        
        <div className="mt-3 text-sm text-gray-500">
          Total itineraries created: {total_credits_used}
        </div>
      </div>
    </div>
  );
}