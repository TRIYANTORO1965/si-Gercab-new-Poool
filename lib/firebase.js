// firebase.js
// lib/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app"; // ✅ pastikan ada getApps dan getApp
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurasi Firebase Anda
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKi6qNrzhl5Jbts6uXxq0vIJVFd148rfU",
  authDomain: "sigercabfixunduhan.firebaseapp.com",
  projectId: "sigercabfixunduhan",
  storageBucket: "sigercabfixunduhan.firebasestorage.app",
  messagingSenderId: "483023560455",
  appId: "1:483023560455:web:dca99321941cbb5cfbafa2",
  measurementId: "G-52L1TPBKFS"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 🔥 Layanan yang kamu gunakan
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Ekspor untuk digunakan di komponen lain
export { app, db, auth };