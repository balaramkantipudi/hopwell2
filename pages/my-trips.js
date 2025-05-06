// pages/my-trips.js
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/libs/supabase';
import Link from 'next/link';

export default function MyTrips() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }

    // Fetch user's trips
    if (user) {
      fetchTrips();
    }
  }, [user, loading, router]);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If still loading auth, show loading state
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
          <h1 className="text-3xl font-bold text-indigo-900">My Trips</h1>
          <p className="mt-2 text-gray-600">View and manage your planned trips</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div key={trip.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-indigo-900 text-white p-4">
                    <h3 className="font-semibold text-lg">{trip.title || `Trip to ${trip.destination}`}</h3>
                    <p className="text-sm text-indigo-100">{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4">
                    <p><span className="font-medium">Destination:</span> {trip.destination}</p>
                    <p><span className="font-medium">From:</span> {trip.origin}</p>
                    <p><span className="font-medium">Theme:</span> {trip.theme}</p>
                    
                    <div className="mt-4 flex justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${trip.status === 'generated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {trip.status === 'generated' ? 'Completed' : 'Draft'}
                      </span>
                      <Link 
                        href={`/trips/${trip.id}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't created any trips yet.</p>
              <Link 
                href="/trip-planner"
                className="btn btn-primary bg-indigo-900 text-white px-4 py-2 rounded-md hover:bg-indigo-800"
              >
                Create your first trip
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}