// pages/profile.js
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '@/libs/supabase';

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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
    }
  }, [user, loading, router]);

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
    <div className="min-h-screen bg-yellow-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-indigo-900">Your Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account settings</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {message.text && (
            <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-400' : 'bg-red-50 text-red-800 border-l-4 border-red-400'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="mt-10 pt-6 border-t border-gray-200">
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
      </div>
    </div>
  );
}