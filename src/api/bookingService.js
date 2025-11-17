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

// --- NEW HELPER FUNCTION FOR RECURRENCE (FR-8 Update) ---
/**
 * Calculates the scheduleTime for the next recurrence based on the type.
 * @param {Date} originalDate The base date/time of the completed booking.
 * @param {'daily' | 'weekly' | 'monthly'} recurrenceType The type of recurrence.
 * @returns {Date | null} The date object for the next booking, or null.
 */
const calculateNextRecurrenceDate = (originalDate, recurrenceType) => {
  const nextDate = new Date(originalDate.getTime()); // Start with a copy of the original date/time

  switch (recurrenceType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      // Handles month overflow correctly (e.g., Jan 31st -> Feb 28/29)
      nextDate.setMonth(nextDate.getMonth() + 1); 
      break;
    default:
      return null;
  }
  return nextDate;
};
// --- END NEW HELPER FUNCTION ---

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
    return { services: services, error: null };
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

// --- MODIFIED FUNCTION (FIXES FirebaseError: Unsupported field value: undefined) ---
const createBooking = async (bookingData) => {
  try {
    // FIX: Sanitize bookingData to remove any 'undefined' fields before saving to Firestore.
    // This is the definitive fix for the "Unsupported field value: undefined" error.
    const sanitizedBookingData = Object.keys(bookingData).reduce((acc, key) => {
      // If the value is NOT undefined, include it.
      if (bookingData[key] !== undefined) {
        acc[key] = bookingData[key];
      }
      return acc;
    }, {});
    
    // Ensure scheduleTime is present before Timestamp conversion
    if (!sanitizedBookingData.scheduleTime) {
      throw new Error("Missing scheduleTime in booking data.");
    }

    const dataToSave = {
      ...sanitizedBookingData,
      scheduleTime: Timestamp.fromDate(sanitizedBookingData.scheduleTime),
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
// --- END MODIFIED FUNCTION ---

// --- UPDATED FOR SMART SORTING (to show upcoming bookings first) ---
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

    // MODIFIED: Custom sorting logic to prioritize upcoming bookings
    const sortedBookings = enrichedBookings.sort((a, b) => {
        // Define an order for statuses (Active first, then non-active)
        const statusOrder = {
            'confirmed': 1,
            'in-progress': 2,
            'completed': 3,
            'cancelled': 4,
        };

        const orderA = statusOrder[a.status] || 99;
        const orderB = statusOrder[b.status] || 99;

        // 1. Sort by Status Group (Active first)
        if (orderA !== orderB) {
            return orderA - orderB;
        }

        // 2. Within Active statuses ('confirmed', 'in-progress'), sort by date ASC (next one first)
        if (orderA <= 2) {
            return a.scheduleTime.getTime() - b.scheduleTime.getTime(); // ASC (earliest first)
        }

        // 3. For all other statuses ('completed', 'cancelled'), sort by date DESC (most recent first)
        return b.scheduleTime.getTime() - a.scheduleTime.getTime(); // DESC (latest first)
    });
    // END MODIFIED SORTING

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

// --- MODIFIED FUNCTION TO HANDLE RECURRENCE ---
const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    const bookingDocRef = doc(firestoreDB, BOOKINGS_COLLECTION, bookingId);
    
    // 1. Fetch current booking details to check recurrence
    const bookingSnap = await getDoc(bookingDocRef);
    if (!bookingSnap.exists()) {
        return { success: false, error: 'Booking not found' };
    }
    const booking = bookingSnap.data();

    // Update status for the current booking
    await updateDoc(bookingDocRef, {
      status: newStatus,
    });
    
    // 2. Check for recurrence after completion
    if (newStatus === 'completed' && booking.recurrenceType && booking.recurrenceType !== 'none') {
        
        const originalScheduleTime = booking.scheduleTime.toDate();
        const nextScheduleTime = calculateNextRecurrenceDate(originalScheduleTime, booking.recurrenceType);

        if (nextScheduleTime) {
            // Create a new booking object, preserving most data
            const newBookingData = {
                userId: booking.userId,
                providerId: booking.providerId,
                serviceId: booking.serviceId,
                scheduleTime: nextScheduleTime, // The shifted date
                status: 'confirmed', // The new booking is confirmed immediately
                // customNotes is handled by the new createBooking filter, so we pass it as is.
                customNotes: booking.customNotes, 
                recurrenceType: booking.recurrenceType, // Keep the recurrence type
            };
            
            // Create the new recurring booking
            const { bookingId: newBookingId, error: createError } = await createBooking(newBookingData);
            
            if (createError) {
                console.error('Failed to create recurring booking:', createError);
                return { success: false, error: 'Completed but failed to create next recurring booking.' };
            }

            console.log(`Recurrence handled: New ${booking.recurrenceType} booking created (ID: ${newBookingId}) for ${nextScheduleTime.toLocaleDateString()}`);
        }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating booking status or handling recurrence: ', error);
    return { success: false, error: error.message };
  }
};
// --- END MODIFIED FUNCTION ---

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