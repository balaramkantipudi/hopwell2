




// pages/profile.js - Improved version
// import { useAuth } from '@/components/AuthContext';
// import { useRouter } from 'next/router';
// import { useState, useEffect } from 'react';
// import { supabase } from '@/libs/supabase';
// import Head from 'next/head';
// import TripHeader from '@/components/TripHeader';
// import Footer from '@/components/Footer';
// import UserCredits from '@/components/UserCredits';

// export default function Profile() {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });
//   const [stats, setStats] = useState({
//     totalTrips: 0,
//     tripsThisMonth: 0,
//     favoriteDestination: ''
//   });

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
      
//       // Fetch user stats
//       fetchUserStats();
//     }
//   }, [user, loading, router]);

//   const fetchUserStats = async () => {
//     if (!user) return;
    
//     try {
//       // Get all user trips
//       const { data: trips, error } = await supabase
//         .from('trips')
//         .select('*')
//         .eq('user_id', user.id);
        
//       if (error) throw error;
      
//       // Calculate stats
//       if (trips && trips.length > 0) {
//         // Total trips
//         const totalTrips = trips.length;
        
//         // Trips this month
//         const now = new Date();
//         const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//         const tripsThisMonth = trips.filter(trip => {
//           const createdAt = new Date(trip.created_at);
//           return createdAt >= startOfMonth;
//         }).length;
        
//         // Calculate favorite destination
//         const destinations = {};
//         trips.forEach(trip => {
//           if (trip.destination) {
//             destinations[trip.destination] = (destinations[trip.destination] || 0) + 1;
//           }
//         });
        
//         let favoriteDestination = '';
//         let maxCount = 0;
        
//         Object.entries(destinations).forEach(([destination, count]) => {
//           if (count > maxCount) {
//             maxCount = count;
//             favoriteDestination = destination;
//           }
//         });
        
//         setStats({
//           totalTrips,
//           tripsThisMonth,
//           favoriteDestination
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching user stats:', error);
//     }
//   };

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
//     <>
//       <Head>
//         <title>Your Profile | Hopwell</title>
//       </Head>
      
//       <TripHeader />
      
//       <main className="min-h-screen bg-yellow-50 py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-indigo-900">Your Profile</h1>
//             <p className="mt-2 text-gray-600">Manage your account settings and view your usage</p>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Left Column - Profile Information */}
//             <div className="lg:col-span-2">
//               <div className="bg-white shadow rounded-lg overflow-hidden">
//                 <div className="bg-indigo-900 px-6 py-4">
//                   <h2 className="text-xl font-semibold text-white">Account Information</h2>
//                 </div>
                
//                 {message.text && (
//                   <div className={`p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-400' : 'bg-red-50 text-red-800 border-l-4 border-red-400'}`}>
//                     {message.text}
//                   </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                   <div>
//                     <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//                       Name
//                     </label>
//                     <div className="mt-1">
//                       <input
//                         id="name"
//                         name="name"
//                         type="text"
//                         value={formData.name}
//                         onChange={handleChange}
//                         className="appearance-none bg-white block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                       Email
//                     </label>
//                     <div className="mt-1">
//                       <input
//                         id="email"
//                         name="email"
//                         type="email"
//                         value={formData.email}
//                         disabled
//                         className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-900 sm:text-sm"
//                       />
//                       <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
//                     </div>
//                   </div>

//                   <div className="pt-4">
//                     <button
//                       type="submit"
//                       disabled={isLoading}
//                       className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                     >
//                       {isLoading ? 'Saving...' : 'Save Changes'}
//                     </button>
//                   </div>
//                 </form>

//                 <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
//                   <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
                  
//                   <div className="mt-4">
//                     <button
//                       onClick={async () => {
//                         const confirmed = window.confirm('Are you sure you want to sign out?');
//                         if (confirmed) {
//                           await supabase.auth.signOut();
//                           router.push('/');
//                         }
//                       }}
//                       className="text-indigo-600 hover:text-indigo-800"
//                     >
//                       Sign out of all devices
//                     </button>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Stats Cards */}
//               <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
//                 <div className="bg-white overflow-hidden shadow rounded-lg">
//                   <div className="px-4 py-5 sm:p-6">
//                     <dl>
//                       <dt className="text-sm font-medium text-gray-500 truncate">
//                         Total Trips
//                       </dt>
//                       <dd className="mt-1 text-3xl font-semibold text-indigo-900">
//                         {stats.totalTrips}
//                       </dd>
//                     </dl>
//                   </div>
//                 </div>
                
//                 <div className="bg-white overflow-hidden shadow rounded-lg">
//                   <div className="px-4 py-5 sm:p-6">
//                     <dl>
//                       <dt className="text-sm font-medium text-gray-500 truncate">
//                         Trips This Month
//                       </dt>
//                       <dd className="mt-1 text-3xl font-semibold text-indigo-900">
//                         {stats.tripsThisMonth}
//                       </dd>
//                     </dl>
//                   </div>
//                 </div>
                
//                 <div className="bg-white overflow-hidden shadow rounded-lg">
//                   <div className="px-4 py-5 sm:p-6">
//                     <dl>
//                       <dt className="text-sm font-medium text-gray-500 truncate">
//                         Favorite Destination
//                       </dt>
//                       <dd className="mt-1 text-2xl font-semibold text-indigo-900 truncate">
//                         {stats.favoriteDestination || 'None yet'}
//                       </dd>
//                     </dl>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Right Column - Credits and Subscriptions */}
//             <div className="space-y-8">
//               {/* Credits Component */}
//               <UserCredits />
              
//               {/* Subscription Info */}
//               <div className="bg-white shadow rounded-lg overflow-hidden">
//                 <div className="bg-indigo-900 px-6 py-4">
//                   <h2 className="text-xl font-semibold text-white">Your Plan</h2>
//                 </div>
                
//                 <div className="p-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <span className="text-lg font-medium text-gray-900">Free Plan</span>
//                     <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
//                       Active
//                     </span>
//                   </div>
                  
//                   <ul className="mt-4 space-y-2">
//                     <li className="flex items-start">
//                       <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                       </svg>
//                       <span className="text-gray-700">30 itinerary generations per month</span>
//                     </li>
//                     <li className="flex items-start">
//                       <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                       </svg>
//                       <span className="text-gray-700">Basic itinerary customization</span>
//                     </li>
//                     <li className="flex items-start">
//                       <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                       </svg>
//                       <span className="text-gray-700">Save unlimited trips</span>
//                     </li>
//                   </ul>
                  
//                   <div className="mt-6">
//                     <button 
//                       onClick={() => alert('Premium plans coming soon!')}
//                       className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
//                     >
//                       Upgrade to Premium
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
      
//       <Footer />
//     </>
//   );
// }




// pages/profile.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TripHeader from '@/components/TripHeader';
import Footer from '@/components/Footer';
import { supabase } from '@/libs/supabase';
import { useAuth } from '@/components/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [userCredits, setUserCredits] = useState(0);
  const [nextResetDate, setNextResetDate] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!user && !isLoading) {
      router.push('/auth/signin');
    }
    
    // Fetch profile data
    if (user) {
      fetchProfileData();
      fetchUserTrips();
      fetchUserCredits();
    }
  }, [user, isLoading]);

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Fix any NaN values by setting them to 0 if null/undefined
      const safeProfile = {
        ...data,
        trips_count: data.trips_count || 0,
        countries_visited: data.countries_visited || 0
      };
      
      setProfileData(safeProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const fetchUserCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits, last_credit_reset, subscription_tier')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching user credits:', error);
        setUserCredits(0);
        return;
      }
      
      setUserCredits(data?.credits || 0);
      setSubscriptionTier(data?.subscription_tier || 'free');
      
      // Calculate next reset date
      const lastReset = data?.last_credit_reset ? new Date(data.last_credit_reset) : new Date();
      const nextReset = new Date(lastReset);
      nextReset.setMonth(nextReset.getMonth() + 1);
      nextReset.setDate(1);
      setNextResetDate(nextReset.toLocaleDateString());
    } catch (error) {
      console.error('Error fetching user credits:', error);
      setUserCredits(0);
    }
  };

  const handleUpgradeSubscription = async (tier) => {
    setIsPurchasing(true);
    try {
      // In a real implementation, this would connect to a payment processor
      // For now, we'll just update the database directly
      
      const newCredits = tier === 'pro' ? 100 : 30;
      
      const { error } = await supabase
        .from('user_credits')
        .update({ 
          subscription_tier: tier,
          credits: newCredits,
          last_credit_reset: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Refresh user credits
      fetchUserCredits();
      setShowSubscriptionModal(false);
      
      // Show success message or redirect
      alert(`Successfully upgraded to ${tier.toUpperCase()} plan!`);
      
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('Failed to upgrade subscription. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Subscription modal
  const SubscriptionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Upgrade Your Plan</h2>
            <button 
              onClick={() => setShowSubscriptionModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer" onClick={() => handleUpgradeSubscription('free')}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-lg">Free Plan</h3>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Current</span>
              </div>
              <p className="text-gray-600 mb-2">Perfect for occasional travelers</p>
              <ul className="space-y-1 text-sm text-gray-500">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  30 free credits per month
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic itinerary generation
                </li>
              </ul>
              <div className="mt-4 text-center">
                <span className="font-bold text-2xl">$0</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
            </div>
            
            <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50 hover:shadow-md transition cursor-pointer" onClick={() => handleUpgradeSubscription('pro')}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-lg">Pro Plan</h3>
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">Recommended</span>
              </div>
              <p className="text-gray-600 mb-2">For frequent travelers and professionals</p>
              <ul className="space-y-1 text-sm text-gray-500">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  100 credits per month
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced itinerary options
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority customer support
                </li>
              </ul>
              <div className="mt-4 text-center">
                <span className="font-bold text-2xl">$9.99</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            By upgrading, you agree to our terms of service and privacy policy.
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <TripHeader />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile | Hopwell</title>
      </Head>

      <TripHeader />

      {showSubscriptionModal && <SubscriptionModal />}

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Personal Info */}
            <div className="md:col-span-1">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-indigo-700 text-white p-6">
                  <h2 className="text-xl font-bold">Account Settings</h2>
                </div>
                <div className="p-6">
                  {profileData && (
                    <div className="space-y-6">
                      <div>
                        <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold mx-auto mb-4">
                          {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h3 className="text-center font-semibold text-lg mb-1">{profileData.full_name || 'Traveler'}</h3>
                        <p className="text-center text-gray-500 text-sm">{profileData.email || user.email}</p>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Current Plan</h4>
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded text-sm ${subscriptionTier === 'pro' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                            {subscriptionTier === 'pro' ? 'Pro' : 'Free'}
                          </span>
                          <button 
                            onClick={() => setShowSubscriptionModal(true)} 
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            {subscriptionTier === 'pro' ? 'Manage Plan' : 'Upgrade'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Columns - Stats and Recent Trips */}
            <div className="md:col-span-2">
              {/* Travel Stats Card */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                <div className="bg-indigo-700 text-white p-6">
                  <h2 className="text-xl font-bold">Travel Statistics</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-indigo-600">{profileData?.trips_count || 0}</p>
                      <p className="text-gray-600">Trips Planned</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-indigo-600">{profileData?.countries_visited || 0}</p>
                      <p className="text-gray-600">Countries</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-indigo-600">{userCredits || 0}</p>
                      <p className="text-gray-600">Credits</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Credits & Subscription Card */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                <div className="bg-indigo-700 text-white p-6">
                  <h2 className="text-xl font-bold">Your Credits</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <p className="text-gray-700">You get 
                        <span className="font-semibold text-indigo-600 mx-1">
                          {subscriptionTier === 'pro' ? '100' : '30'}
                        </span> 
                        credits each month
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Next reset: {nextResetDate}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-3">
                      <button 
                        onClick={() => router.push('/trip-planner')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                      >
                        Plan a Trip
                      </button>
                      <button 
                        onClick={() => setShowSubscriptionModal(true)}
                        className={`px-4 py-2 rounded border hover:bg-gray-50 ${
                          subscriptionTier === 'pro' 
                            ? 'border-gray-300 text-gray-700' 
                            : 'border-indigo-600 text-indigo-600'
                        }`}
                      >
                        {subscriptionTier === 'pro' ? 'Manage Plan' : 'Get More Credits'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Trips */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-indigo-700 text-white p-6">
                  <h2 className="text-xl font-bold">Recent Trips</h2>
                </div>
                <div className="p-6">
                  {trips.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trips.slice(0, 4).map((trip) => (
                        <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <h3 className="font-semibold text-lg mb-1">{trip.title || 'Untitled Trip'}</h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {trip.start_date && trip.end_date ? 
                              `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}` : 
                              'No dates specified'}
                          </p>
                          <button 
                            onClick={() => router.push(`/my-trips/${trip.id}`)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            View details →
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <p className="text-gray-600 mb-3">You haven&apos;t planned any trips yet.</p>
                      <button 
                        onClick={() => router.push('/trip-planner')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                      >
                        Plan Your First Trip
                      </button>
                    </div>
                  )}
                  
                  {trips.length > 4 && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => router.push('/my-trips')}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View All Trips →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}