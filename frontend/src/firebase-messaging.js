// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDx2oWPjyFWMl0opP4RpyfjXPzBaSi_3nc",
  authDomain: "rento-f1d61.firebaseapp.com",
  projectId: "rento-f1d61",
  storageBucket: "rento-f1d61.firebasestorage.app",
  messagingSenderId: "888767906490",
  appId: "1:888767906490:web:d16ed2e7d116d2b888f883",
  measurementId: "G-GC5E5HFXB6"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export { messaging, getToken };