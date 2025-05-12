// pages/my-trips.js - Modern redesign
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/libs/supabase';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import TripHeader from '@/components/TripHeader';
import Footer from '@/components/Footer';

// Helper to get a destination image (with fallbacks)
const getDestinationImage = (destination) => {
  if (!destination) return '/image1.png';
  
  // List of popular destinations with specific images
  const destinationMappings = {
    'paris': '/image1.png',
    'london': '/image2.png',
    'new york': '/image3.png',
    'tokyo': '/image4.png',
    'rome': '/image5.png',
    'bali': '/image6.png',
    'amsterdam': '/image7.png',
    'barcelona': '/image8.png',
    'dubai': '/image9.png',
  };
  
  // Check if destination contains any of the keys
  const matchedDestination = Object.keys(destinationMappings).find(
    key => destination.toLowerCase().includes(key)
  );
  
  if (matchedDestination) {
    return destinationMappings[matchedDestination];
  }
  
  // Return default image if no match found
  // Use a deterministic approach to select from available images
  const destinationSum = destination.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const imageIndex = (destinationSum % 9) + 1; // Results in 1-9
  return `/image${imageIndex}.png`;
};

export default function MyTrips() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'destination', or 'duration'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

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

  // Sort trips based on current sort settings
  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'destination') {
      return sortDirection === 'asc'
        ? a.destination.localeCompare(b.destination)
        : b.destination.localeCompare(a.destination);
    } else if (sortBy === 'duration') {
      const durationA = new Date(a.end_date) - new Date(a.start_date);
      const durationB = new Date(b.end_date) - new Date(b.start_date);
      return sortDirection === 'asc' ? durationA - durationB : durationB - durationA;
    }
    return 0;
  });

  // Function to format date ranges in a friendly way
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Dates not specified';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If same month and year
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    
    // If same year
    if (start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - ${end.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}, ${end.getFullYear()}`;
    }
    
    // Different years
    return `${start.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})} - ${end.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`;
  };

  // Calculate trip duration in days
  const getTripDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Duration not specified';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    
    return days === 1 ? '1 day' : `${days} days`;
  };

  // Toggle sort direction
  const toggleSort = (sortType) => {
    if (sortBy === sortType) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortType);
      setSortDirection('asc');
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
    <>
      <Head>
        <title>My Trips | Hopwell</title>
      </Head>
      
      <TripHeader />
      
      <main className="min-h-screen bg-yellow-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">My Trips</h1>
              <p className="mt-2 text-gray-600">
                {trips.length > 0 
                  ? `You have ${trips.length} saved ${trips.length === 1 ? 'trip' : 'trips'}`
                  : 'Start planning your next adventure'}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
              {/* View Mode Toggle */}
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    viewMode === 'list' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              {/* Create New Trip Button */}
              <Link 
                href="/trip-planner"
                className="bg-indigo-900 text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors inline-flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Trip
              </Link>
            </div>
          </div>
          
          {/* Sort Controls - only show if there are trips */}
          {trips.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-gray-700 font-medium">Sort by:</span>
                
                <button 
                  onClick={() => toggleSort('date')}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm ${
                    sortBy === 'date' 
                      ? 'bg-indigo-100 text-indigo-800 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Date Created
                  {sortBy === 'date' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <button 
                  onClick={() => toggleSort('destination')}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm ${
                    sortBy === 'destination' 
                      ? 'bg-indigo-100 text-indigo-800 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Destination
                  {sortBy === 'destination' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <button 
                  onClick={() => toggleSort('duration')}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm ${
                    sortBy === 'duration' 
                      ? 'bg-indigo-100 text-indigo-800 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Duration
                  {sortBy === 'duration' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Content Section */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : trips.length > 0 ? (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedTrips.map((trip) => (
                    <div key={trip.id} className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow hover:shadow-lg">
                      <div className="relative h-48">
                        <Image
                          src={getDestinationImage(trip.destination)}
                          alt={trip.destination}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-bold text-lg truncate">
                            {trip.title || `Trip to ${trip.destination}`}
                          </h3>
                          <p className="text-white text-sm opacity-90">
                            {formatDateRange(trip.start_date, trip.end_date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-700">{trip.destination}</span>
                          </div>
                          
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            trip.status === 'generated' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {trip.status === 'generated' ? 'Completed' : 'Draft'}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-600">{getTripDuration(trip.start_date, trip.end_date)}</span>
                        </div>
                        
                        <div className="flex justify-end mt-2">
                          <Link 
                            href={`/trips/${trip.id}`}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* List View */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <ul>
                    {sortedTrips.map((trip, index) => (
                      <li key={trip.id} className={`${index !== 0 ? 'border-t border-gray-200' : ''}`}>
                        <Link href={`/trips/${trip.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-indigo-200 flex-shrink-0 mr-4">
                                <Image
                                  src={getDestinationImage(trip.destination)}
                                  alt={trip.destination}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {trip.title || `Trip to ${trip.destination}`}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {trip.destination} • {formatDateRange(trip.start_date, trip.end_date)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center mt-2 sm:mt-0">
                              <span className={`px-2 py-1 text-xs rounded-full mr-4 ${
                                trip.status === 'generated' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {trip.status === 'generated' ? 'Completed' : 'Draft'}
                              </span>
                              
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="inline-block p-6 bg-indigo-100 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">You haven't created any trips yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start planning your next adventure with our AI-powered trip planner. Create personalized itineraries based on your preferences.
              </p>
              <Link 
                href="/trip-planner"
                className="bg-indigo-900 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 font-medium transition-colors inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Your First Trip
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );}