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
} from 'firebase/firestore';
import { ref, onValue, get, set } from 'firebase/database';
import { firestoreDB, realtimeDB } from './firebase';
import { profileService } from './profileService';

const SERVICES_COLLECTION = 'Services';
const BOOKINGS_COLLECTION = 'bookings';
const PROVIDER_LOCATIONS_REF = 'providerLocations';

// --- ORIGINAL FUNCTION (RESTORED) ---
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
    console.error('Error fetching service details:', error);
    return { service: null, error: error.message };
  }
};

// --- ORIGINAL FUNCTION (RESTORED) ---
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
    console.error('Error fetching services: ', error);
    return { services: [], error: error.message };
  }
};

// --- UPDATED FOR REVIEW SYSTEM ---
const getProvidersForService = async (serviceId) => {
  try {
    const providersQuery = query(
      collection(firestoreDB, 'users'),
      where('role', '==', 'provider'),
      where('skills', 'array-contains', serviceId)
    );

    const querySnapshot = await getDocs(providersQuery);

    const providersData = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.createdAt && data.createdAt.toDate) {
        data.createdAt = data.createdAt.toDate();
      }
      return { id: doc.id, ...data };
    });

    // Now, enrich providers with their average rating
    const providersWithRating = await Promise.all(
      providersData.map(async (provider) => {
        const { reviews, error } = await profileService.getProviderReviews(
          provider.id
        );
        let averageRating = 0;
        let ratingText = 'New';

        if (!error && reviews.length > 0) {
          const totalRating = reviews.reduce(
            (acc, curr) => acc + (curr.rating || 0),
            0
          );
          averageRating = totalRating / reviews.length;
          ratingText = `${averageRating.toFixed(1)} (${reviews.length} reviews)`;
        }

        return {
          ...provider,
          averageRating: averageRating,
          ratingText: ratingText,
        };
      })
    );

    return { providers: providersWithRating, error: null };
  } catch (error) {
    console.error('Error fetching providers: ', error);
    return { providers: [], error: error.message };
  }
};

// --- ORIGINAL FUNCTION (RESTORED) ---
const createBooking = async (bookingData) => {
  try {
    const dataToSave = {
      ...bookingData,
      scheduleTime: Timestamp.fromDate(bookingData.scheduleTime),
      createdAt: Timestamp.fromDate(new Date()),
    };
    const docRef = await addDoc(
      collection(firestoreDB, BOOKINGS_COLLECTION),
      dataToSave
    );
    return { bookingId: docRef.id, error: null };
  } catch (error) {
    console.error('Error creating booking: ', error);
    return { bookingId: null, error: error.message };
  }
};

// --- UPDATED FOR REVIEW SYSTEM ---
const getUserBookings = async (userId) => {
  try {
    const bookingsQuery = query(
      collection(firestoreDB, BOOKINGS_COLLECTION),
      where('userId', '==', userId),
      // Show active bookings AND completed bookings (for rating)
      where('status', 'in', ['confirmed', 'in-progress', 'completed'])
    );

    const querySnapshot = await getDocs(bookingsQuery);

    const bookingsData = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt,
        scheduleTime: data.scheduleTime?.toDate
          ? data.scheduleTime.toDate()
          : data.scheduleTime,
      };
    });

    const enrichedBookings = await Promise.all(
      bookingsData.map(async (booking) => {
        let providerName = 'Unknown Provider';
        let serviceName = 'Unknown Service';

        if (booking.providerId) {
          const { profile } = await profileService.getUserProfile(
            booking.providerId
          );
          if (profile && profile.name) {
            providerName = profile.name;
          }
        }

        if (booking.serviceId) {
          const { service } = await getServiceDetails(booking.serviceId);
          if (service && service.Name) {
            serviceName = service.Name;
          }
        }

        return {
          ...booking,
          providerName: providerName,
          serviceName: serviceName,
        };
      })
    );

    const sortedBookings = enrichedBookings.sort(
      (a, b) => b.scheduleTime - a.scheduleTime
    );

    return { bookings: sortedBookings, error: null };
  } catch (error) {
    console.error('Error fetching user bookings: ', error);
    return { bookings: [], error: error.message };
  }
};

// --- UPDATED FOR HIDING OLD BOOKINGS ---
const getProviderBookings = async (providerId) => {
  try {
    const bookingsQuery = query(
      collection(firestoreDB, BOOKINGS_COLLECTION),
      where('providerId', '==', providerId),
      // Providers only see active jobs
      where('status', 'in', ['confirmed', 'in-progress'])
    );
    const querySnapshot = await getDocs(bookingsQuery);

    const bookingsData = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt,
        scheduleTime: data.scheduleTime?.toDate
          ? data.scheduleTime.toDate()
          : data.scheduleTime,
      };
    });

    const enrichedBookings = await Promise.all(
      bookingsData.map(async (booking) => {
        let clientName = 'Unknown Client';
        let serviceName = 'Unknown Service';

        if (booking.userId) {
          const { profile } = await profileService.getUserProfile(booking.userId);
          if (profile && profile.name) {
            clientName = profile.name;
          }
        }

        if (booking.serviceId) {
          const { service } = await getServiceDetails(booking.serviceId);
          if (service && service.Name) {
            serviceName = service.Name;
          }
        }

        return {
          ...booking,
          clientName: clientName,
          serviceName: serviceName,
        };
      })
    );

    const sortedBookings = enrichedBookings.sort(
      (a, b) => b.scheduleTime - a.scheduleTime
    );

    return { bookings: sortedBookings, error: null };
  } catch (error) {
    console.error('Error fetching provider bookings: ', error);
    return { bookings: [], error: error.message };
  }
};

// --- ORIGINAL FUNCTION (RESTORED) ---
const listenToProviderLocation = (providerId, callback) => {
  const providerLocationRef = ref(
    realtimeDB,
    `${PROVIDER_LOCATIONS_REF}/${providerId}`
  );

  const unsubscribe = onValue(
    providerLocationRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error listening to provider location: ', error);
      callback(null);
    }
  );

  return unsubscribe;
};

// --- ORIGINAL FUNCTION (RESTORED) ---
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
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating provider location: ', error);
    return { success: false, error: error.message };
  }
};

// --- ORIGINAL FUNCTION (RESTORED) ---
const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    const bookingDocRef = doc(firestoreDB, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingDocRef, {
      status: newStatus,
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating booking status: ', error);
    return { success: false, error: error.message };
  }
};

// --- EXPORT ALL FUNCTIONS ---
export const bookingService = {
  getAvailableServices,
  getProvidersForService,
  createBooking,
  getUserBookings,
  listenToProviderLocation,
  updateProviderLocation,
  getProviderBookings,
  getServiceDetails,
  updateBookingStatus,
};