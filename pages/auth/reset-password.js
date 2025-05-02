// pages/auth/reset-password.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.png';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Verify token when component mounts
    const verifyToken = async () => {
      if (!token) return;
      
      try {
        const res = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setIsValidToken(true);
        } else {
          setMessage('Invalid or expired token. Please request a new password reset.');
          setIsValidToken(false);
        }
      } catch (err) {
        setMessage('An error occurred. Please try again.');
        setIsValidToken(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

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
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setIsSuccess(true);
      setMessage('Your password has been reset successfully.');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // If loading or no token, show loading state
  if (!token) {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Image src={logo} alt="Hopwell" width={80} height={80} className="mx-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-900">
            Reset your password
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/">
            <Image src={logo} alt="Hopwell" width={80} height={80} className="mx-auto" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-900">
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className={`${isSuccess ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'} border-l-4 p-4 mb-6`}>
              <div className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>{message}</div>
            </div>
          )}

          {!isValidToken && (
            <div className="text-center">
              <p className="mb-4">Invalid or expired token.</p>
              <Link href="/auth/forgot-password" className="text-indigo-600 hover:text-indigo-500">
                Request a new password reset
              </Link>
            </div>
          )}

          {isValidToken && !isSuccess && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          {isSuccess && (
            <div className="text-center">
              <p className="mb-4">Your password has been reset successfully. Redirecting to login...</p>
              <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
                Go to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}