import { useState, useEffect, createContext, useContext } from 'react'
import { onAuthChange, getCurrentUser } from '../services/firebase'

// Create the authentication context
const AuthContext = createContext()

// Provider component that wraps the app and makes auth available
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = onAuthChange((authUser) => {
            if (authUser) {
                setUser({
                    uid: authUser.uid,
                    email: authUser.email,
                    displayName: authUser.displayName,
                    photoURL: authUser.photoURL
                })
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        // Cleanup subscription
        return () => unsubscribe()
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