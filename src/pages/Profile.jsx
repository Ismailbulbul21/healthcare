import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function Profile() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Not Logged In</h2>
          <p className="text-red-600 mb-4">Please log in to view your profile</p>
          <Link
            to="/login"
            className="inline-block bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 py-16"
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 border-b bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <h2 className="text-xl font-bold">Your Profile</h2>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <div className="mt-1 font-medium text-gray-900">{user.displayName || 'Not set'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email Address</label>
              <div className="mt-1 font-medium text-gray-900">{user.email}</div>
            </div>

            <div className="pt-4">
              <Link
                to="/chat"
                className="block w-full text-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Go to AI Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Profile 
 