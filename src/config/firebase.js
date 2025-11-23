import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

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

// Initialize Firebase Auth only
export const auth = getAuth(app)

export default app


