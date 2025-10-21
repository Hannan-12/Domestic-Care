// src/api/bookingService.js
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { ref, onValue, get, set } from 'firebase/database';
import { firestoreDB, realtimeDB } from './firebase';

const SERVICES_COLLECTION = 'services';
const BOOKINGS_COLLECTION = 'bookings';
const PROVIDER_LOCATIONS_REF = 'providerLocations'; // Using Realtime DB for live location

/**
 * Fetches the list of available services (Housekeeping, Pet Care, etc.)
 * Corresponds to FR-5 [cite: 273]
 */
const getAvailableServices = async () => {
  try {
    const servicesQuery = query(collection(firestoreDB, SERVICES_COLLECTION));
    const querySnapshot = await getDocs(servicesQuery);
    const services = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { services, error: null };
  } catch (error) {
    return { services: [], error: error.message };
  }
};

/**
 * Searches for providers based on service type.
 * This can be expanded with more filters (time, location) as per FR-5 [cite: 273]
 */
const getProvidersForService = async (serviceId) => {
  try {
    // This assumes providers have their services listed in their profiles
    const providersQuery = query(
      collection(firestoreDB, 'userProfiles'),
      where('role', '==', 'provider'),
      where('skills', 'array-contains', serviceId)
    );
    
    const querySnapshot = await getDocs(providersQuery);
    const providers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { providers, error: null };
  } catch (error) {
    return { providers: [], error: error.message };
  }
};

/**
 * Creates a new booking in Firestore.
 * Corresponds to FR-6 (Book Immediate/Scheduled) [cite: 277]
 * and FR-7 (Add Custom Notes) [cite: 278]
 */
const createBooking = async (bookingData) => {
  // bookingData should include:
  // { userId, providerId, serviceId, scheduleTime, isImmediate, customNotes, status: 'confirmed' }
  try {
    const docRef = await addDoc(
      collection(firestoreDB, BOOKINGS_COLLECTION),
      {
        ...bookingData,
        createdAt: new Date(),
      }
    );
    return { bookingId: docRef.id, error: null };
  } catch (error) {
    return { bookingId: null, error: error.message };
  }
};

/**
 * Fetches all bookings for a specific user.
 */
const getUserBookings = async (userId) => {
  try {
    const bookingsQuery = query(
      collection(firestoreDB, BOOKINGS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(bookingsQuery);
    const bookings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { bookings, error: null };
  } catch (error) {
    return { bookings: [], error: error.message };
  }
};

/**
 * Listens for real-time location updates for a specific provider.
 * Corresponds to FR-9 (Real-Time GPS Tracking) [cite: 284]
 * Uses Realtime Database as specified in CON-1 [cite: 139]
 */
const listenToProviderLocation = (providerId, callback) => {
  const providerLocationRef = ref(
    realtimeDB,
    `${PROVIDER_LOCATIONS_REF}/${providerId}`
  );
  
  // onValue() sets up a persistent listener
  const unsubscribe = onValue(providerLocationRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val()); // e.g., { latitude: 30.123, longitude: 74.456 }
    } else {
      callback(null); // Provider location not available
    }
  });

  return unsubscribe; // Return the function to stop listening
};

/**
 * Updates a provider's location in the Realtime Database
 * (This would be called from the provider's app)
 */
const updateProviderLocation = async (providerId, location) => {
   try {
    const providerLocationRef = ref(
      realtimeDB,
      `${PROVIDER_LOCATIONS_REF}/${providerId}`
    );
    await set(providerLocationRef, {
        ...location,
        lastUpdated: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export const bookingService = {
  getAvailableServices,
  getProvidersForService,
  createBooking,
  getUserBookings,
  listenToProviderLocation,
  updateProviderLocation,
};