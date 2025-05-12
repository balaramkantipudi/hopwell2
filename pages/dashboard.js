// pages/dashboard.js - Updated with credit display
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import UserCreditDisplay from '@/components/UserCreditDisplay';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Check for purchase success message from Stripe redirect
  const purchaseSuccess = router.query.purchase === 'success';

  // If not authenticated, redirect to signin
  if (!loading && !user) {
    router.push('/auth/signin');
    return null;
  }

  // If still loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-indigo-900">Welcome to Your Dashboard</h1>
          <p className="mt-2 text-gray-600">Hello, {user?.user_metadata?.name || user?.email}!</p>
        </div>

        {/* Purchase success message */}
        {purchaseSuccess && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Credit purchase successful! Your credits have been added to your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credit display */}
        <div className="max-w-3xl mx-auto mb-8">
          <UserCreditDisplay />
        </div>

        {/* Quick actions */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/trip-planner" 
                  className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-lg text-indigo-700 hover:bg-indigo-100 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Trip
                </Link>
                <Link 
                  href="/my-trips" 
                  className="inline-flex items-center justify-center p-4 bg-purple-50 rounded-lg text-purple-700 hover:bg-purple-100 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View My Trips
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trips section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Trips</h2>
          
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Ready to plan your next adventure?</p>
            <Link 
              href="/trip-planner"
              className="btn btn-primary bg-indigo-900 text-white px-4 py-2 rounded-md hover:bg-indigo-800"
            >
              Create a new trip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}