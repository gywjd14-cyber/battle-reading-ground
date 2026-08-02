/**
 * Firebase Integration Module for Battle Reading Ground
 * Auth: Google Sign-In & Anonymous Sign-In
 * Database: Firestore Realtime Sync
 * Supports Vercel Environment Variables
 */

// Firebase SDK 10 ESM Imports via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInAnonymously, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Read from Environment Variables or Window global (Vercel Integration)
const getEnvVar = (key, fallback) => {
    if (typeof window !== 'undefined' && window[key]) return window[key];
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    return fallback;
};

// Firebase Configuration Keys
const firebaseConfig = {
    apiKey: getEnvVar("FIREBASE_API_KEY", "AIzaSyAUwbza_6YoGiPvmUnBPB1pmJQlZ6Vy1ws"),
    authDomain: getEnvVar("FIREBASE_AUTH_DOMAIN", "battle-reading-ground.firebaseapp.com"),
    projectId: getEnvVar("FIREBASE_PROJECT_ID", "battle-reading-ground"),
    storageBucket: getEnvVar("FIREBASE_STORAGE_BUCKET", "battle-reading-ground.firebasestorage.app"),
    messagingSenderId: getEnvVar("FIREBASE_MESSAGING_SENDER_ID", "395989620767"),
    appId: getEnvVar("FIREBASE_APP_ID", "1:395989620767:web:7ad3a7bb8f6ef8a12c1d2a"),
    measurementId: getEnvVar("FIREBASE_MEASUREMENT_ID", "G-50XECN4B7Q")
};

// Initialize Firebase
let app, auth, db;
let isFirebaseReady = false;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseReady = true;
    console.log("🔥 Firebase initialized successfully with Environment Variable support.");
} catch (e) {
    console.warn("⚠️ Firebase configuration error:", e);
}

export { 
    auth, 
    db, 
    isFirebaseReady, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInAnonymously, 
    signOut, 
    onAuthStateChanged,
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where 
};
