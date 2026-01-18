// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDz84C1uArcWCy_8mq4t9ZG0Nym4CegZvM",
  authDomain: "sales-tracking-b2ac5.firebaseapp.com",
  projectId: "sales-tracking-b2ac5",
  storageBucket: "sales-tracking-b2ac5.firebasestorage.app",
  messagingSenderId: "544730100546",
  appId: "1:544730100546:web:bc4890ac5e6f1c5c494edb",
  measurementId: "G-SQDFMGRR6Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Messaging (only in browser environment and if supported)
let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    // Register service worker for background notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });
    }
    
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging initialization failed:', error);
  }
}

// VAPID Key - Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
// You can also set it via environment variable
const VAPID_KEY = process.env.VUE_APP_FIREBASE_VAPID_KEY || 'BNx_7yUa2js4TgBlC1QnrTx1wcGiZzv_DN-OxQ3HSRFXuKkURTAYsdjIRWmgPmYZToHm0kw-fqjOmbLmRd6BLnc'

// Ensure service worker is registered
async function ensureServiceWorkerRegistered() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser');
  }

  try {
    // Check if service worker is already registered
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      console.log('Service worker already registered');
      return registration;
    }

    // Register service worker
    console.log('Registering service worker...');
    const newRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('Service worker registered successfully:', newRegistration);
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('Service worker is ready');
    
    return newRegistration;
  } catch (error) {
    console.error('Error registering service worker:', error);
    throw error;
  }
}

// Request notification permission and get FCM token
// NOTE: This function assumes permission is already granted
// Use Notification.requestPermission() directly for requesting permission
export async function requestNotificationPermission() {
  if (!messaging) {
    console.warn('Messaging is not available');
    return null;
  }

  try {
    // First, ensure service worker is registered
    await ensureServiceWorkerRegistered();
    
    // Check current permission status
    const permission = Notification.permission;
    console.log('Current notification permission:', permission);
    
    if (permission !== 'granted') {
      console.warn('Permission is not granted, cannot get FCM token');
      return null;
    }
    
    console.log('Notification permission is granted, getting FCM token...');
    
    // Wait a bit to ensure service worker is fully ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY
    });
    if (token) {
      console.log('FCM token obtained successfully:', token.substring(0, 20) + '...');
    } else {
      console.warn('FCM token is null - this might be a service worker or VAPID key issue');
    }
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    console.error('Error details:', error.message, error.stack);
    throw error;
  }
}

// Get FCM token (without requesting permission)
export async function getFCMToken() {
  if (!messaging) {
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Listen for foreground messages
export function onMessageListener() {
  return new Promise((resolve) => {
    if (!messaging) {
      resolve(null);
      return;
    }

    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}

export { app, analytics, messaging };

