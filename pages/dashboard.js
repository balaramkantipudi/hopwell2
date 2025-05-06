// pages/dashboard.js
import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // If not authenticated, redirect to signin
  if (!loading && !user) {
    router.push('/auth/signin')
    return null
  }

  // If still loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-indigo-900">Welcome to Your Dashboard</h1>
          <p className="mt-2 text-gray-600">Hello, {user?.user_metadata?.name || user?.email}!</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Trips</h2>
          
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any trips yet.</p>
            <Link 
              href="/trip-planner"
              className="btn btn-primary bg-indigo-900 text-white px-4 py-2 rounded-md hover:bg-indigo-800"
            >
              Create your first trip
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}