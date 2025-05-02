// pages/dashboard.js
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If user is not authenticated, redirect to signin
  if (status === "unauthenticated") {
    router.push('/auth/signin');
    return null;
  }

  // If session is loading, show loading state
  if (status === "loading") {
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
          <h1 className="text-3xl font-bold text-indigo-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {session?.user?.name}!</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Trips</h2>
          
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any trips yet.</p>
            <button 
              onClick={() => router.push('/trip-planner')}
              className="btn btn-primary bg-indigo-900 text-white"
            >
              Create your first trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}