import { createClient } from '@supabase/supabase-js'

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication functions
export const registerUser = async (email, password, fullName) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error
    return data.user
  } catch (error) {
    console.error('Error during registration:', error)
    throw error
  }
}

export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data.user
  } catch (error) {
    console.error('Error during login:', error)
    throw error
  }
}

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Error during logout:', error)
    throw error
  }
}

// Auth state observer
export const onAuthChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
  
  return () => {
    data.subscription.unsubscribe()
  }
}

// Auth utils
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser()
  return data?.user
}

// Doctors functions
export const getDoctors = async () => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
  
  if (error) throw error
  return data
}

export const getDoctorById = async (id) => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Availability functions
export const getDoctorAvailability = async (doctorId) => {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('doctor_id', doctorId)
  
  if (error) throw error
  return data
}

// Appointments functions
export const createAppointment = async (appointmentData) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
  
  if (error) throw error
  return data[0]
}

export const getUserAppointments = async (userId) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctors (
        id,
        full_name,
        specialization
      )
    `)
    .eq('patient_id', userId)
  
  if (error) throw error
  return data
}

export { supabase } 