// // pages/profile.js
// import { useAuth } from '@/components/AuthContext';
// import { useRouter } from 'next/router';
// import { useState, useEffect } from 'react';
// import { supabase } from '@/libs/supabase';

// export default function Profile() {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });

//   useEffect(() => {
//     // Redirect if not authenticated
//     if (!loading && !user) {
//       router.push('/auth/signin');
//       return;
//     }

//     // Populate form with user data
//     if (user) {
//       setFormData({
//         name: user.user_metadata?.name || '',
//         email: user.email || '',
//       });
//     }
//   }, [user, loading, router]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage({ text: '', type: '' });

//     try {
//       // Update user metadata
//       const { error } = await supabase.auth.updateUser({
//         data: { name: formData.name }
//       });

//       if (error) throw error;

//       // Update profile in Supabase (if you have a profiles table)
//       const { error: profileError } = await supabase
//         .from('profiles')
//         .upsert({
//           id: user.id,
//           name: formData.name,
//           updated_at: new Date().toISOString()
//         });

//       if (profileError) throw profileError;

//       setMessage({
//         text: 'Profile updated successfully!',
//         type: 'success'
//       });
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       setMessage({
//         text: error.message || 'Failed to update profile',
//         type: 'error'
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // If still loading auth, show loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-yellow-50 py-12">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-12">
//           <h1 className="text-3xl font-bold text-indigo-900">Your Profile</h1>
//           <p className="mt-2 text-gray-600">Manage your account settings</p>
//         </div>

//         <div className="bg-white shadow rounded-lg p-6">
//           {message.text && (
//             <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-400' : 'bg-red-50 text-red-800 border-l-4 border-red-400'}`}>
//               {message.text}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//                 Name
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="name"
//                   name="name"
//                   type="text"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="appearance-none bg-white block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   disabled
//                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-900 sm:text-sm"
//                 />
//                 <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
//               </div>
//             </div>

//             <div className="pt-4">
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 {isLoading ? 'Saving...' : 'Save Changes'}
//               </button>
//             </div>
//           </form>

//           <div className="mt-10 pt-6 border-t border-gray-200">
//             <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
            
//             <div className="mt-4">
//               <button
//                 onClick={async () => {
//                   const confirmed = window.confirm('Are you sure you want to sign out?');
//                   if (confirmed) {
//                     await supabase.auth.signOut();
//                     router.push('/');
//                   }
//                 }}
//                 className="text-indigo-600 hover:text-indigo-800"
//               >
//                 Sign out of all devices
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




// pages/profile.js - Improved version
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '@/libs/supabase';
import Head from 'next/head';
import TripHeader from '@/components/TripHeader';
import Footer from '@/components/Footer';
import UserCredits from '@/components/UserCredits';

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({
    totalTrips: 0,
    tripsThisMonth: 0,
    favoriteDestination: ''
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }

    // Populate form with user data
    if (user) {
      setFormData({
        name: user.user_metadata?.name || '',
        email: user.email || '',
      });
      
      // Fetch user stats
      fetchUserStats();
    }
  }, [user, loading, router]);

  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      // Get all user trips
      const { data: trips, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Calculate stats
      if (trips && trips.length > 0) {
        // Total trips
        const totalTrips = trips.length;
        
        // Trips this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const tripsThisMonth = trips.filter(trip => {
          const createdAt = new Date(trip.created_at);
          return createdAt >= startOfMonth;
        }).length;
        
        // Calculate favorite destination
        const destinations = {};
        trips.forEach(trip => {
          if (trip.destination) {
            destinations[trip.destination] = (destinations[trip.destination] || 0) + 1;
          }
        });
        
        let favoriteDestination = '';
        let maxCount = 0;
        
        Object.entries(destinations).forEach(([destination, count]) => {
          if (count > maxCount) {
            maxCount = count;
            favoriteDestination = destination;
          }
        });
        
        setStats({
          totalTrips,
          tripsThisMonth,
          favoriteDestination
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { name: formData.name }
      });

      if (error) throw error;

      // Update profile in Supabase (if you have a profiles table)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      setMessage({
        text: 'Profile updated successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        text: error.message || 'Failed to update profile',
        type: 'error'
      });
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
    <>
      <Head>
        <title>Your Profile | Hopwell</title>
      </Head>
      
      <TripHeader />
      
      <main className="min-h-screen bg-yellow-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-900">Your Profile</h1>
            <p className="mt-2 text-gray-600">Manage your account settings and view your usage</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-indigo-900 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Account Information</h2>
                </div>
                
                {message.text && (
                  <div className={`p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-400' : 'bg-red-50 text-red-800 border-l-4 border-red-400'}`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="appearance-none bg-white block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-900 sm:text-sm"
                      />
                      <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>

                <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
                  
                  <div className="mt-4">
                    <button
                      onClick={async () => {
                        const confirmed = window.confirm('Are you sure you want to sign out?');
                        if (confirmed) {
                          await supabase.auth.signOut();
                          router.push('/');
                        }
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Sign out of all devices
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Trips
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-indigo-900">
                        {stats.totalTrips}
                      </dd>
                    </dl>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Trips This Month
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-indigo-900">
                        {stats.tripsThisMonth}
                      </dd>
                    </dl>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Favorite Destination
                      </dt>
                      <dd className="mt-1 text-2xl font-semibold text-indigo-900 truncate">
                        {stats.favoriteDestination || 'None yet'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Credits and Subscriptions */}
            <div className="space-y-8">
              {/* Credits Component */}
              <UserCredits />
              
              {/* Subscription Info */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-indigo-900 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Your Plan</h2>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-gray-900">Free Plan</span>
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">30 itinerary generations per month</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Basic itinerary customization</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Save unlimited trips</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6">
                    <button 
                      onClick={() => alert('Premium plans coming soon!')}
                      className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}