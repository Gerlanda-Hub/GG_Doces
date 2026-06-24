import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - Mundo de Doces da GG
const firebaseConfig = {
  apiKey: 'AIzaSyBh4SPyMqyg72iJvCDnpYJDXODDYVwdqcA',
  authDomain: 'gg-doces.firebaseapp.com',
  projectId: 'gg-doces',
  storageBucket: 'gg-doces.firebasestorage.app',
  messagingSenderId: '579156756621',
  appId: '1:579156756621:web:0e57506f8d727180d27ac4'
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export app for any additional configuration
export default app;

// Collection names for Firestore
export const COLLECTIONS = {
  ORDERS: 'orders',
  CLIENTS: 'clients',
  MESSAGES: 'messages',
  TESTIMONIALS: 'testimonials',
  GALLERY: 'gallery',
  SETTINGS: 'settings',
} as const;

// Storage paths
export const STORAGE_PATHS = {
  ORDER_IMAGES: 'order-images',
  GALLERY_IMAGES: 'gallery',
  AVATARS: 'avatars',
} as const;