import { initializeApp } from 'firebase/app'
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYEBSFKxTtcBvbwxz7m5-xCCebb1nJ46o",
    authDomain: "healthcarechat-2ec94.firebaseapp.com",
    projectId: "healthcarechat-2ec94",
    storageBucket: "healthcarechat-2ec94.firebasestorage.app",
    messagingSenderId: "822228374621",
    appId: "1:822228374621:web:3b75c9bd880ff6cb9be9b4"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Authentication functions
export const registerUser = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        // Update profile with display name
        await updateProfile(userCredential.user, { displayName })
        return userCredential.user
    } catch (error) {
        console.error('Error during registration:', error)
        throw error
    }
}

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        return userCredential.user
    } catch (error) {
        console.error('Error during login:', error)
        throw error
    }
}

export const logoutUser = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error('Error during logout:', error)
        throw error
    }
}

// Auth state observer
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback)
}

// Auth utils
export const getCurrentUser = () => {
    return auth.currentUser
}

export { auth, db } 