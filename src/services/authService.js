import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { auth } from '../config/firebase'

/**
 * Authentication Service
 * Handles all Firebase authentication operations
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName })
      }
      
      return userCredential.user
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Sign in existing user
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Sign out current user
   */
  async logout() {
    try {
      await signOut(auth)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates) {
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user logged in')
      
      await updateProfile(user, updates)
      return user
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Update user email
   */
  async updateUserEmail(newEmail, currentPassword) {
    try {
      const user = auth.currentUser
      if (!user || !user.email) throw new Error('No user logged in')
      
      // Re-authenticate user before email change
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      await updateEmail(user, newEmail)
      return user
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser
      if (!user || !user.email) throw new Error('No user logged in')
      
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      await updatePassword(user, newPassword)
      return user
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth.currentUser
  }

  /**
   * Handle Firebase auth errors
   */
  handleAuthError(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/weak-password': 'Password is too weak',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/requires-recent-login': 'Please log in again to complete this action',
    }

    const message = errorMessages[error.code] || error.message || 'An error occurred'
    return new Error(message)
  }
}

export default new AuthService()

