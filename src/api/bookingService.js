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
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { ref, onValue, set } from 'firebase/database';
import { firestoreDB, realtimeDB } from './firebase';
import { profileService } from './profileService';

const SERVICES_COLLECTION = 'Services';
const BOOKINGS_COLLECTION = 'bookings';
const REQUESTS_COLLECTION = 'serviceRequests';
const PROVIDER_LOCATIONS_REF = 'providerLocations';

// --- Sanitize Data ---
const sanitizeData = (data) => {
  return Object.keys(data).reduce((acc, key) => {
    const value = data[key];
    if (value !== undefined && !Number.isNaN(value)) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

// --- Convert Dates ---
const convertDates = (data) => {
    const newData = { ...data };
    ['scheduleTime', 'startTime', 'endTime', 'createdAt'].forEach(field => {
        if (newData[field]) {
            newData[field] = newData[field]?.toDate ? newData[field].toDate() : new Date(newData[field]);
        }
    });
    return newData;
};

// --- EXISTING BOOKING FUNCTIONS ---

const getServiceDetails = async (serviceId) => {
  try {
    const serviceDocRef = doc(firestoreDB, SERVICES_COLLECTION, serviceId);
    const docSnap = await getDoc(serviceDocRef);
    if (docSnap.exists()) {
      return { service: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { service: null, error: 'No such service!' };
    }
  } catch (error) {
    return { service: null, error: error.message };
  }
};

const getAvailableServices = async () => {
  try {
    const servicesQuery = query(collection(firestoreDB, SERVICES_COLLECTION));
    const querySnapshot = await getDocs(servicesQuery);
    const services = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { services: services, error: null };
  } catch (error) {
    return { services: [], error: error.message };
  }
};

const getProvidersForService = async (serviceId) => {
  try {
    const providersQuery = query(
      collection(firestoreDB, 'users'),
      where('role', '==', 'provider'),
      where('skills', 'array-contains', serviceId)
    );
    const querySnapshot = await getDocs(providersQuery);
    const providersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    const providersWithRating = await Promise.all(
      providersData.map(async (provider) => {
        const { reviews } = await profileService.getProviderReviews(provider.id);
        let averageRating = 0;
        let ratingText = 'New';
        if (reviews && reviews.length > 0) {
          const total = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
          averageRating = total / reviews.length;
          ratingText = `${averageRating.toFixed(1)} (${reviews.length})`;
        }
        return { ...provider, averageRating, ratingText };
      })
    );
    return { providers: providersWithRating, error: null };
  } catch (error) {
    return { providers: [], error: error.message };
  }
};

const createBooking = async (bookingData) => {
  try {
    const cleanData = sanitizeData(bookingData);
    const dataToSave = {
      ...cleanData,
      scheduleTime: Timestamp.fromDate(new Date(cleanData.scheduleTime)),
      createdAt: Timestamp.fromDate(new Date()),
    };
    
    const docRef = await addDoc(collection(firestoreDB, BOOKINGS_COLLECTION), dataToSave);
    return { bookingId: docRef.id, error: null };
  } catch (error) {
    return { bookingId: null, error: error.message };
  }
};

const getUserBookings = async (userId) => {
  try {
    const bookingsQuery = query(
      collection(firestoreDB, BOOKINGS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(bookingsQuery);
    const bookings = querySnapshot.docs.map(doc => {
        return {
            id: doc.id, 
            ...convertDates(doc.data()) 
        };
    });
    return { bookings, error: null };
  } catch (error) {
    return { bookings: [], error: error.message };
  }
};

const getProviderBookings = async (providerId) => {
   try {
    const q = query(collection(firestoreDB, BOOKINGS_COLLECTION), where('providerId', '==', providerId));
    const snap = await getDocs(q);
    const bookings = snap.docs.map(doc => {
         return { id: doc.id, ...convertDates(doc.data()) };
    });
    return { bookings, error: null };
   } catch(e) { return { bookings: [], error: e.message }; }
};

const listenToProviderLocation = (providerId, callback) => {
  const providerLocationRef = ref(realtimeDB, `${PROVIDER_LOCATIONS_REF}/${providerId}`);
  return onValue(providerLocationRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null);
  });
};

const updateProviderLocation = async (providerId, location) => {
  try {
    const locRef = ref(realtimeDB, `${PROVIDER_LOCATIONS_REF}/${providerId}`);
    await set(locRef, { ...location, lastUpdated: new Date().toISOString() });
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
};

const updateBookingStatus = async (bookingId, status) => {
    try {
        await updateDoc(doc(firestoreDB, BOOKINGS_COLLECTION, bookingId), { status });
        return { success: true };
    } catch(e) { return { success: false, error: e.message }; }
};

// --- REQUESTS FUNCTIONS ---

const createServiceRequest = async (requestData) => {
    try {
        const cleanData = sanitizeData(requestData);
        const data = {
            ...cleanData,
            startTime: Timestamp.fromDate(new Date(cleanData.startTime)),
            endTime: Timestamp.fromDate(new Date(cleanData.endTime)),
            createdAt: Timestamp.fromDate(new Date())
        };
        const docRef = await addDoc(collection(firestoreDB, REQUESTS_COLLECTION), data);
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ** UPDATED: Removed orderBy for immediate fix **
const getOpenRequests = async () => {
    try {
        const q = query(
            collection(firestoreDB, REQUESTS_COLLECTION),
            where('status', '==', 'open')
            // orderBy('createdAt', 'desc') <--- Disabled to prevent Index Error
        );
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(d => {
            return { id: d.id, ...convertDates(d.data()) };
        });
        return { requests, error: null };
    } catch (error) {
        console.error("Error fetching open requests:", error);
        return { requests: [], error: error.message };
    }
};

const getClientRequests = async (clientId) => {
    try {
        const q = query(
            collection(firestoreDB, REQUESTS_COLLECTION),
            where('clientId', '==', clientId)
        );
        const snapshot = await getDocs(q);
        const requests = snapshot.docs
            .map(d => ({ id: d.id, ...convertDates(d.data()) }))
            .filter(req => req.status === 'open'); 
        return { requests, error: null };
    } catch(e) { return { requests: [], error: e.message }; }
};

const placeBid = async (requestId, providerData, amount, comment) => {
    try {
        const requestRef = doc(firestoreDB, REQUESTS_COLLECTION, requestId);
        const requestSnap = await getDoc(requestRef);
        let currentBids = requestSnap.data().bids || [];
        
        currentBids = currentBids.filter(bid => bid.providerId !== providerData.uid);
        
        const newBid = {
            providerId: providerData.uid,
            providerName: providerData.name,
            providerAvatar: providerData.avatarUrl || null,
            offerAmount: amount,
            comment: comment,
            createdAt: new Date().toISOString()
        };
        
        await updateDoc(requestRef, {
            bids: [...currentBids, sanitizeData(newBid)]
        });
        return { success: true };
    } catch(e) { return { success: false, error: e.message }; }
};

const acceptBid = async (request, bid) => {
    try {
        const bookingData = {
            userId: request.clientId,
            providerId: bid.providerId,
            serviceId: request.serviceId,
            serviceName: request.serviceName,
            scheduleTime: request.startTime, 
            status: 'confirmed',
            totalPrice: bid.offerAmount,
            address: request.address
        };
        
        const { bookingId, error } = await createBooking(bookingData);
        if(error) throw new Error(error);

        const requestRef = doc(firestoreDB, REQUESTS_COLLECTION, request.id);
        await updateDoc(requestRef, { status: 'booked', bookedBy: bid.providerId });

        return { success: true };
    } catch(e) { return { success: false, error: e.message }; }
};

const sendMessage = async (requestId, messageData) => {
    try {
        const msgsRef = collection(firestoreDB, REQUESTS_COLLECTION, requestId, 'messages');
        await addDoc(msgsRef, {
            ...messageData,
            createdAt: Timestamp.fromDate(new Date())
        });
        return { success: true };
    } catch(e) { return { success: false, error: e.message }; }
};

export const bookingService = {
  getAvailableServices,
  getProvidersForService,
  createBooking,
  getUserBookings,
  getProviderBookings,
  listenToProviderLocation,
  updateProviderLocation,
  getServiceDetails,
  updateBookingStatus,
  createServiceRequest,
  getOpenRequests,
  getClientRequests,
  placeBid,
  acceptBid,
  sendMessage
};