import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: 'AIzaSyBD-ta2O7Mzfx2l-LQK81LaX6BfciIVC3w',
  authDomain: 'app-recomensas.firebaseapp.com',
  projectId: 'app-recomensas',
  storageBucket: 'app-recomensas.firebasestorage.app',
  messagingSenderId: '84103782682',
  appId: '1:84103782682:web:6bee451c4b5b528dae0ca3',
  measurementId: 'G-0XQ178C6J4'
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(firebaseApp)
