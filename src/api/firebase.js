import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAKUZ00n5cjJm0jiSbWADkwTOScs3OfsfU",
  authDomain: "domesticcareservicesapp.firebaseapp.com",
  projectId: "domesticcareservicesapp",
  storageBucket: "domesticcareservicesapp.appspot.com",
  messagingSenderId: "951162536195",
  appId: "1:951162536195:android:f480aa66bdd6791e69e936",
  measurementId: "G-XXXXXXXXXX"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});


const firestoreDB = getFirestore(app);
const realtimeDB = getDatabase(app);
const storage = getStorage(app);

export { auth, firestoreDB, realtimeDB, storage, app };