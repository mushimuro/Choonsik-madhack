import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyA58kkRLwf4Sq3i6nv4ACbuO5x5ZgvSWY0",
  authDomain: "choonsik-madhack.firebaseapp.com",
  projectId: "choonsik-madhack",
  storageBucket: "choonsik-madhack.firebasestorage.app",
  messagingSenderId: "2342628402",
  appId: "1:2342628402:web:3c26e95d6503c72e7d202b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

export default app

