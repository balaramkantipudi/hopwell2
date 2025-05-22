// components/AuthDebug.js
// Add this component temporarily to debug authentication issues

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/libs/supabase';

export default function AuthDebug() {
  const { user } = useAuth();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionInfo({
        hasSession: !!session,
        hasUser: !!session?.user,
        hasToken: !!session?.access_token,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: error?.message
      });
    } catch (err) {
      setSessionInfo({
        error: err.message
      });
    }
  };

  const testSimpleAPI = async () => {
    try {
      const response = await fetch('/api/simple-test');
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        simpleTest: { success: true, data }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        simpleTest: { success: false, error: error.message }
      }));
    }
  };

  const testAuthAPI = async () => {
    try {
      // Get session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session available');
      }

      const response = await fetch('/api/test-credits', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'x-user-id': session.user.id
        }
      });
      
      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        authTest: { 
          success: response.ok, 
          status: response.status,
          data 
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        authTest: { success: false, error: error.message }
      }));
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h4 className="font-bold mb-2">Auth Debug Panel</h4>
      
      <div className="text-xs space-y-2">
        <div>
          <strong>Auth Context:</strong>
          <div>User: {user ? '✅' : '❌'}</div>
          <div>ID: {user?.id?.substring(0, 8)}...</div>
        </div>
        
        <div>
          <strong>Session Info:</strong>
          <div>Session: {sessionInfo?.hasSession ? '✅' : '❌'}</div>
          <div>Token: {sessionInfo?.hasToken ? '✅' : '❌'}</div>
          <div>User ID: {sessionInfo?.userId?.substring(0, 8)}...</div>
          {sessionInfo?.error && <div className="text-red-600">Error: {sessionInfo.error}</div>}
        </div>
        
        <div className="space-y-1">
          <button 
            onClick={testSimpleAPI}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2"
          >
            Test Simple API
          </button>
          <button 
            onClick={testAuthAPI}
            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
          >
            Test Auth API
          </button>
        </div>
        
        {testResults.simpleTest && (
          <div>
            <strong>Simple API:</strong>
            <div className={testResults.simpleTest.success ? 'text-green-600' : 'text-red-600'}>
              {testResults.simpleTest.success ? '✅ Success' : '❌ Failed'}
            </div>
          </div>
        )}
        
        {testResults.authTest && (
          <div>
            <strong>Auth API:</strong>
            <div className={testResults.authTest.success ? 'text-green-600' : 'text-red-600'}>
              {testResults.authTest.success ? '✅ Success' : '❌ Failed'}
            </div>
            <div>Status: {testResults.authTest.status}</div>
            {testResults.authTest.error && <div className="text-red-600">{testResults.authTest.error}</div>}
          </div>
        )}
        
        <button 
          onClick={checkSession}
          className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}