import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import authService from '../services/authService'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const register = async (email, password, displayName) => {
    return authService.register(email, password, displayName)
  }

  const login = async (email, password) => {
    return authService.login(email, password)
  }

  const logout = async () => {
    return authService.logout()
  }

  const resetPassword = async (email) => {
    return authService.resetPassword(email)
  }

  const updateProfile = async (updates) => {
    return authService.updateUserProfile(updates)
  }

  const updateEmail = async (newEmail, currentPassword) => {
    return authService.updateUserEmail(newEmail, currentPassword)
  }

  const updatePassword = async (currentPassword, newPassword) => {
    return authService.updateUserPassword(currentPassword, newPassword)
  }

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    updateEmail,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

