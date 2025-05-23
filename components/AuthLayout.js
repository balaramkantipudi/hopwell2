// // components/AuthLayout.js
// import { useRouter } from 'next/router';
// import { useState, useEffect } from 'react';
// import { useAuth } from './AuthContext'; // Use our custom Supabase auth hook
// import Link from 'next/link';
// import Image from 'next/image';
// import logo from '@/public/logo.png';

// export default function AuthLayout({ children }) {
//   const router = useRouter();
//   const { user, status } = useAuth(); // Use our Supabase auth hook
  
//   // If still loading, show a loading screen
//   if (status === "loading") {
//     return (
//       <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
//       </div>
//     );
//   }

//   // If not authenticated, redirect to login
//   if (status === "unauthenticated") {
//     router.push('/auth/signin');
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-yellow-50">
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex">
//               <div className="flex-shrink-0 flex items-center">
//                 <Link href="/">
//                   <Image src={logo} alt="Hopwell" width={40} height={40} />
//                 </Link>
//               </div>
//               <nav className="ml-6 flex space-x-8">
//                 <Link href="/trip-planner" className="inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium text-gray-900">
//                   Trip Planner
//                 </Link>
//                 <Link href="/my-trips" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
//                   My Trips
//                 </Link>
//                 <Link href="/profile" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
//                   Profile
//                 </Link>
//               </nav>
//             </div>
//             <div className="flex items-center">
//               <button
//                 onClick={() => {
//                   // Use Supabase signOut method from our auth context
//                   const { supabase } = require('@/libs/supabase');
//                   supabase.auth.signOut().then(() => {
//                     router.push('/');
//                   });
//                 }}
//                 className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 Sign out
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main>{children}</main>
//     </div>
//   );
// }


// components/AuthLayout.js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Use our custom Supabase auth hook
import TripHeader from './TripHeader'; // Import TripHeader instead of using a separate header
import Footer from './Footer';

export default function AuthLayout({ children }) {
  const router = useRouter();
  const { user, status } = useAuth(); // Use our Supabase auth hook
  
  // If still loading, show a loading screen
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (status === "unauthenticated") {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <TripHeader />
      <main>{children}</main>
      <Footer />
    </div>
  );
}