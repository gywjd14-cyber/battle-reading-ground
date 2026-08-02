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

// Firebase Configuration (Updated with User's actual Project keys)
const firebaseConfig = {
    apiKey: "AIzaSyAUwbza_6YoGiPvmUnBPB1pmJQlZ6Vy1ws",
    authDomain: "battle-reading-ground.firebaseapp.com",
    projectId: "battle-reading-ground",
    storageBucket: "battle-reading-ground.firebasestorage.app",
    messagingSenderId: "395989620767",
    appId: "1:395989620767:web:7ad3a7bb8f6ef8a12c1d2a",
    measurementId: "G-50XECN4B7Q"
};

// Initialize Firebase
let app, auth, db;
let isFirebaseReady = false;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseReady = true;
    console.log("🔥 Firebase initialized successfully with actual config.");
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
