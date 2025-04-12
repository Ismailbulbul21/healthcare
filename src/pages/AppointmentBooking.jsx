import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDoctors, getDoctorAvailability, createAppointment } from '../services/supabase'

function AppointmentBooking() {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [notes, setNotes] = useState('')
  
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  
  // Fetch doctors on component mount
  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoading(true)
        const doctorsData = await getDoctors()
        setDoctors(doctorsData)
        setLoading(false)
      } catch (error) {
        console.error('Error loading doctors:', error)
        setError('Failed to load doctors. Please try again later.')
        setLoading(false)
      }
    }
    
    if (isAuthenticated) {
      loadDoctors()
    } else {
      navigate('/login', { state: { from: '/appointments' } })
    }
  }, [isAuthenticated, navigate])
  
  // Load availability when doctor is selected
  useEffect(() => {
    async function loadAvailability() {
      if (!selectedDoctor) return
      
      try {
        setLoading(true)
        const availabilityData = await getDoctorAvailability(selectedDoctor.id)
        
        // Generate dates for the next 14 days
        const dates = []
        const today = new Date()
        
        for (let i = 1; i <= 14; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          
          // Check if this day of week has availability
          const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
          const hasAvailability = availabilityData.some(slot => slot.day_of_week === dayOfWeek)
          
          if (hasAvailability) {
            dates.push({
              date: date.toISOString().split('T')[0],
              dayOfWeek
            })
          }
        }
        
        setAvailableDates(dates)
        setLoading(false)
      } catch (error) {
        console.error('Error loading availability:', error)
        setError('Failed to load doctor availability. Please try again later.')
        setLoading(false)
      }
    }
    
    loadAvailability()
  }, [selectedDoctor])
  
  // Load time slots when date is selected
  useEffect(() => {
    async function loadTimeSlots() {
      if (!selectedDoctor || !selectedDate) return
      
      try {
        const availabilityData = await getDoctorAvailability(selectedDoctor.id)
        const selectedDateObj = new Date(selectedDate)
        const dayOfWeek = selectedDateObj.getDay()
        
        // Filter availability for the selected day of week
        const dayAvailability = availabilityData.filter(slot => slot.day_of_week === dayOfWeek)
        
        // Generate 30-minute time slots within availability
        const timeSlots = []
        
        dayAvailability.forEach(slot => {
          const startTime = new Date(`2000-01-01T${slot.start_time}`)
          const endTime = new Date(`2000-01-01T${slot.end_time}`)
          
          while (startTime < endTime) {
            const slotStart = startTime.toTimeString().substring(0, 5)
            startTime.setMinutes(startTime.getMinutes() + 30)
            const slotEnd = startTime.toTimeString().substring(0, 5)
            
            if (startTime <= endTime) {
              timeSlots.push({
                text: `${slotStart} - ${slotEnd}`,
                value: `${slotStart}-${slotEnd}`
              })
            }
          }
        })
        
        setAvailableTimeSlots(timeSlots)
      } catch (error) {
        console.error('Error loading time slots:', error)
        setError('Failed to load available time slots. Please try again later.')
      }
    }
    
    loadTimeSlots()
  }, [selectedDoctor, selectedDate])
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot) {
      setError('Please select a doctor, date, and time slot.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Parse the selected time slot
      const [startTime, endTime] = selectedTimeSlot.split('-')
      
      // Create the appointment
      await createAppointment({
        patient_id: user.uid,
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        notes,
        status: 'scheduled'
      })
      
      setSuccess(true)
      // Reset form
      setSelectedDoctor(null)
      setSelectedDate('')
      setSelectedTimeSlot('')
      setNotes('')
      setLoading(false)
    } catch (error) {
      console.error('Error creating appointment:', error)
      setError('Failed to book appointment. Please try again later.')
      setLoading(false)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 py-12 mt-16"
    >
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="text-gray-600 mt-2">Schedule a consultation with one of our healthcare professionals</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">Your appointment has been successfully booked!</p>
            <button 
              onClick={() => setSuccess(false)}
              className="mt-2 text-green-700 underline"
            >
              Book another appointment
            </button>
          </div>
        )}
        
        {!success && (
          <form onSubmit={handleSubmit}>
            {/* Step 1: Select Doctor */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Doctor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map(doctor => (
                  <div 
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedDoctor?.id === doctor.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-3">
                        {doctor.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doctor.full_name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Experience: {doctor.experience_years} years</p>
                    {doctor.description && (
                      <p className="text-sm text-gray-600">{doctor.description}</p>
                    )}
                  </div>
                ))}
                
                {loading && <p className="col-span-full text-center py-8">Loading doctors...</p>}
                
                {!loading && doctors.length === 0 && (
                  <p className="col-span-full text-center py-8 text-gray-600">
                    No doctors available at the moment. Please check back later.
                  </p>
                )}
              </div>
            </div>
            
            {/* Step 2: Select Date */}
            {selectedDoctor && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Date</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {availableDates.map(({ date, dayOfWeek }) => {
                    const dateObj = new Date(date)
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    
                    return (
                      <div
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`border rounded-lg p-3 cursor-pointer text-center transition-all ${
                          selectedDate === date
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <p className="text-sm font-medium">{dayNames[dayOfWeek]}</p>
                        <p className="text-xl font-bold">{dateObj.getDate()}</p>
                        <p className="text-xs text-gray-600">{monthNames[dateObj.getMonth()]}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Step 3: Select Time Slot */}
            {selectedDate && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Time Slot</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableTimeSlots.map(slot => (
                    <div
                      key={slot.value}
                      onClick={() => setSelectedTimeSlot(slot.value)}
                      className={`border rounded-lg p-3 cursor-pointer text-center transition-all ${
                        selectedTimeSlot === slot.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <p className="font-medium">{slot.text}</p>
                    </div>
                  ))}
                  
                  {availableTimeSlots.length === 0 && (
                    <p className="col-span-full text-center py-4 text-gray-600">
                      No available time slots for the selected date.
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Notes */}
            {selectedTimeSlot && (
              <div className="mb-8">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific concerns or information you'd like to share"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            {/* Submit Button */}
            {selectedTimeSlot && (
              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Booking Appointment...
                    </span>
                  ) : (
                    'Book Appointment'
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </motion.div>
  )
}

export default AppointmentBooking 