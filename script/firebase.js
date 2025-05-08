import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFLeFeDtupsxyVi-v0A7kpkV_liajPju8",
  authDomain: "si-gercap-final-f6254.firebaseapp.com",
  projectId: "si-gercap-final-f6254",
  storageBucket: "si-gercap-final-f6254.firebasestorage.app",
  messagingSenderId: "779889964308",
  appId: "1:779889964308:web:67c9dd1e89dd65feefbe01",
  measurementId: "G-92L72HHRTV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
