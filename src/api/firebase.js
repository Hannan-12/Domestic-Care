// src/api/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Get this from: Project Settings > General > Your apps > (Click your Web app)
const firebaseConfig = {
  apiKey: 'AIzaSyAKUZ00n5cJm0ijSbWADkwTOScs3Ofsfu', // From your screenshot
  authDomain: 'PASTE_YOUR_AUTH_DOMAIN_HERE', // From your new Web app config
  databaseURL: 'https://domesticcareserviceapp-default-rtdb.firebaseio.com',
  projectId: 'domesticcareserviceapp', // From your screenshot
  storageBucket: 'PASTE_YOUR_STORAGE_BUCKET_HERE', // From your new Web app config
  messagingSenderId: 'PASTE_YOUR_MESSAGING_SENDER_ID_HERE', // From your new Web app config
  appId: 'PASTE_YOUR_WEB_APP_ID_HERE', // From your new Web app config
  measurementId: 'PASTE_YOUR_MEASUREMENT_ID_HERE', // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestoreDB = getFirestore(app);
const realtimeDB = getDatabase(app); // For Firebase Realtime Database
const storage = getStorage(app);

export { auth, firestoreDB, realtimeDB, storage };