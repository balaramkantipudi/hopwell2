// components/TripHeader.js
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './AuthContext';
import logo from '@/public/logo.png';

const TripHeader = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <Image src={logo} alt="Hopwell" width={40} height={40} />
              </Link>
            </div>
            <nav className="ml-6 flex space-x-8">
              <Link href="/trip-planner" className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                router.pathname === '/trip-planner' 
                  ? 'border-indigo-500 text-sm font-medium text-gray-900' 
                  : 'border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
                Trip Planner
              </Link>
              <Link href="/my-trips" className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                router.pathname === '/my-trips' 
                  ? 'border-indigo-500 text-sm font-medium text-gray-900' 
                  : 'border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
                My Trips
              </Link>
              <Link href="/profile" className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                router.pathname === '/profile' 
                  ? 'border-indigo-500 text-sm font-medium text-gray-900' 
                  : 'border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            {user ? (
              <button
                onClick={() => signOut()}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign out
              </button>
            ) : (
              <Link href="/auth/signin" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TripHeader;