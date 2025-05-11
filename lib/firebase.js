// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Pastikan ini diimpor dengan benar
import { getFirestore } from "firebase/firestore";

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyBDvjmK1wjxo-pHpu7tlkRm_ljR73LuAcU",
  authDomain: "si-gercabfix2-6e3a6.firebaseapp.com",
  projectId: "si-gercabfix2-6e3a6",
  storageBucket: "si-gercabfix2-6e3a6.appspot.com",  // Perbaiki storageBucket dengan .app -> .appspot.com
  messagingSenderId: "1056492464124",
  appId: "1:1056492464124:web:d9b1e95cf091500d737479"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Auth dan Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
