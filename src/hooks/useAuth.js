import { useState, useEffect, createContext, useContext } from 'react'
import { onAuthChange, getCurrentUser } from '../services/supabase'

// Create the authentication context
const AuthContext = createContext()

// Provider component that wraps the app and makes auth available
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get current user on mount
        const loadUser = async () => {
            try {
                const currentUser = await getCurrentUser()
                if (currentUser) {
                    setUser({
                        uid: currentUser.id,
                        email: currentUser.email,
                        displayName: currentUser.user_metadata?.full_name || '',
                        photoURL: currentUser.user_metadata?.avatar_url || ''
                    })
                } else {
                    setUser(null)
                }
            } catch (error) {
                console.error('Error loading user:', error)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        
        loadUser()

        // Subscribe to auth state changes
        let unsubscribeFn = null
        try {
            unsubscribeFn = onAuthChange((authUser) => {
                if (authUser) {
                    setUser({
                        uid: authUser.id,
                        email: authUser.email,
                        displayName: authUser.user_metadata?.full_name || '',
                        photoURL: authUser.user_metadata?.avatar_url || ''
                    })
                } else {
                    setUser(null)
                }
                setLoading(false)
            })
        } catch (error) {
            console.error('Error setting up auth subscription:', error)
            setLoading(false)
        }

        // Cleanup subscription
        return () => {
            if (typeof unsubscribeFn === 'function') {
                try {
                    unsubscribeFn()
                } catch (error) {
                    console.error('Error unsubscribing from auth changes:', error)
                }
            }
        }
    }, [])

    const value = {
        user,
        loading,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

// Hook for components to get the auth object
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
} 