/**
 * Firebase Integration Module for Battle Reading Ground
 * Auth: Google Sign-In & Anonymous Sign-In
 * Database: Firestore Realtime Sync
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

// Firebase Configuration (Replace with your actual Firebase Project keys)
const firebaseConfig = {
    apiKey: "AIzaSyYOUR_ACTUAL_API_KEY_HERE",
    authDomain: "battle-reading-ground.firebaseapp.com",
    projectId: "battle-reading-ground",
    storageBucket: "battle-reading-ground.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
let app, auth, db;
let isFirebaseReady = false;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseReady = true;
    console.log("🔥 Firebase initialized successfully.");
} catch (e) {
    console.warn("⚠️ Firebase configuration placeholder active. Local demo fallback enabled.", e);
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
