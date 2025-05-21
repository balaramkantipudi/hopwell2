// components/AuthUserMenu.js
// This component will be used within your existing Header for authenticated users
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/libs/supabase';

export default function AuthUserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userCredits, setUserCredits] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user credits
  useEffect(() => {
    if (user) {
      fetchUserCredits();
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const fetchUserCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching user credits:', error);
        return;
      }
      
      setUserCredits(data?.credits || 0);
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Check if the current route is active
  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <div className="flex items-center space-x-6">
      <nav className="hidden md:flex space-x-6">
        <Link 
          href="/trip-planner" 
          className={`font-medium transition ${isActive('/trip-planner') ? 'text-white' : 'text-indigo-200 hover:text-white'}`}
        >
          Trip Planner
        </Link>
        <Link 
          href="/my-trips" 
          className={`font-medium transition ${isActive('/my-trips') ? 'text-white' : 'text-indigo-200 hover:text-white'}`}
        >
          My Trips
        </Link>
      </nav>
      
      {/* Credits display */}
      <div className="hidden md:flex items-center bg-indigo-800 px-3 py-1 rounded-lg">
        <span className="text-xs text-indigo-200">Credits:</span>
        <span className="ml-1 font-semibold">{userCredits}</span>
      </div>
      
      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 hover:text-indigo-200 transition"
          aria-label="User menu"
          aria-expanded={isDropdownOpen}
        >
          <div className="h-8 w-8 rounded-full bg-indigo-700 flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
            {/* Mobile only: Credits and navigation */}
            <div className="md:hidden px-4 py-2 text-gray-700 border-b border-gray-200">
              <span className="text-xs text-gray-500">Available Credits:</span>
              <span className="ml-1 font-semibold text-indigo-600">{userCredits}</span>
            </div>
            
            <Link 
              href="/trip-planner" 
              className="md:hidden block px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setIsDropdownOpen(false)}
            >
              Trip Planner
            </Link>
            <Link 
              href="/my-trips" 
              className="md:hidden block px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setIsDropdownOpen(false)}
            >
              My Trips
            </Link>
            
            {/* Always visible dropdown items */}
            <Link 
              href="/profile" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setIsDropdownOpen(false)}
            >
              Profile
            </Link>
            <button 
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}