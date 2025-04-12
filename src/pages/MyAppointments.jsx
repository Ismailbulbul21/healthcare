import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getUserAppointments } from '../services/supabase'

function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  
  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true)
        
        if (user?.uid) {
          const appointmentsData = await getUserAppointments(user.uid)
          
          // Sort appointments by date and time
          const sortedAppointments = appointmentsData.sort((a, b) => {
            // Compare dates first
            const dateA = new Date(a.appointment_date)
            const dateB = new Date(b.appointment_date)
            if (dateA > dateB) return 1
            if (dateA < dateB) return -1
            
            // If dates are equal, compare times
            return a.start_time.localeCompare(b.start_time)
          })
          
          setAppointments(sortedAppointments)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading appointments:', error)
        setError('Failed to load appointments. Please try again later.')
        setLoading(false)
      }
    }
    
    if (isAuthenticated) {
      loadAppointments()
    } else {
      navigate('/login', { state: { from: '/appointments/my' } })
    }
  }, [isAuthenticated, navigate, user])
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  // Group appointments by date
  const appointmentsByDate = appointments.reduce((groups, appointment) => {
    const date = appointment.appointment_date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(appointment)
    return groups
  }, {})
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 py-12 mt-16"
    >
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-2">View and manage your scheduled appointments</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
          <button
            onClick={() => navigate('/appointments')}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Book New Appointment
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No appointments found</h3>
            <p className="mt-2 text-gray-600">You don't have any scheduled appointments yet.</p>
            <button
              onClick={() => navigate('/appointments')}
              className="mt-4 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Book Your First Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(appointmentsByDate).map(([date, dateAppointments]) => (
              <div key={date} className="border-t border-gray-200 pt-6 first:border-0 first:pt-0">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{formatDate(date)}</h3>
                <div className="space-y-4">
                  {dateAppointments.map(appointment => (
                    <div 
                      key={appointment.id} 
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="p-4 md:p-5 flex-grow">
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-3">
                              {appointment.doctors.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{appointment.doctors.full_name}</h4>
                              <p className="text-sm text-gray-600">{appointment.doctors.specialization}</p>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1 mt-4">
                            <div className="flex">
                              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{appointment.start_time} - {appointment.end_time}</span>
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-4 text-sm text-gray-600">
                              <p className="font-medium mb-1">Notes:</p>
                              <p>{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="md:w-32 bg-gray-50 p-4 flex flex-row md:flex-col justify-between items-center md:items-start border-t md:border-t-0 md:border-l border-gray-200">
                          <div className="px-3 py-1 rounded-full text-sm capitalize font-medium
                            ${
                              appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }"
                          >
                            {appointment.status}
                          </div>
                          
                          <button
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default MyAppointments 