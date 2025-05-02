// pages/auth/forgot-password.js
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setIsSuccess(true);
      setMessage('Password reset instructions have been sent to your email.');
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className={`${isSuccess ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'} border-l-4 p-4 mb-6`}>
              <div className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>{message}</div>
            </div>
          )}

          {!isSuccess && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {isLoading ? 'Sending...' : 'Send reset instructions'}
                </button>
              </div>
            </form>
          )}

          {isSuccess && (
            <div className="text-center">
              <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
                Return to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}