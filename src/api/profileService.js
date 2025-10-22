import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { firestoreDB } from './firebase';

// This is the one-line fix:
// Changed 'userProfiles' to 'users' to match your Firebase Rules
const PROFILES_COLLECTION = 'users';
const REVIEWS_COLLECTION = 'reviews';

/**
 * Creates a new user profile document in Firestore after registration.
 * This is typically called right after FR-1 (User Registration).
 */
const createUserProfile = async (userId, profileData) => {
  // profileData should include { email, name, address, contact, role: 'client' or 'provider' }
  try {
    const userDocRef = doc(firestoreDB, PROFILES_COLLECTION, userId);
    await setDoc(userDocRef, {
      ...profileData,
      createdAt: new Date(),
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Fetches a user's profile data.
 */
const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(firestoreDB, PROFILES_COLLECTION, userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return { profile: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { profile: null, error: 'No such profile!' };
    }
  } catch (error) {
    return { profile: null, error: error.message };
  }
};

/**
 * Updates a user's profile information.
 * Corresponds to FR-4 (Update/Delete Profile).
 */
const updateUserProfile = async (userId, updatedData) => {
  try {
    const userDocRef = doc(firestoreDB, PROFILES_COLLECTION, userId);
    await updateDoc(userDocRef, updatedData);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Adds provider-specific details like skills and availability.
 * Corresponds to FR-3 (Add Provider Skills & Availability).
 */
const updateProviderDetails = async (providerId, details) => {
  // details should be { skills: ['housekeeping', 'pet_care'], availability: {...} }
  try {
    const providerDocRef = doc(firestoreDB, PROFILES_COLLECTION, providerId);
    await updateDoc(providerDocRef, {
      ...details,
      profileStatus: 'complete',
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Deletes a user's profile.
 * Corresponds to FR-4 (Update/Delete Profile).
 */
const deleteUserProfile = async (userId) => {
  try {
    const userDocRef = doc(firestoreDB, PROFILES_COLLECTION, userId);
    await deleteDoc(userDocRef);
    // You should also delete the user from Firebase Auth here
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Submits a rating and review for a provider.
 * Corresponds to FR-13 (Rate & Review Provider).
 */
const submitProviderReview = async (reviewData) => {
  // reviewData: { providerId, clientId, bookingId, rating: 5, comment: 'Great job!' }
  try {
    const docRef = await addDoc(collection(firestoreDB, REVIEWS_COLLECTION), {
      ...reviewData,
      type: 'provider_review',
      createdAt: new Date(),
    });
    // You might also update the provider's average rating here
    return { reviewId: docRef.id, error: null };
  } catch (error) {
    return { reviewId: null, error: error.message };
  }
};

/**
 * Fetches all reviews for a specific provider.
 */
const getProviderReviews = async (providerId) => {
  try {
    const reviewsQuery = query(
      collection(firestoreDB, REVIEWS_COLLECTION),
      where('providerId', '==', providerId),
      where('type', '==', 'provider_review')
    );
    const querySnapshot = await getDocs(reviewsQuery);
    const reviews = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { reviews, error: null };
  } catch (error) {
    return { reviews: [], error: error.message };
  }
};

export const profileService = {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateProviderDetails,
  deleteUserProfile,
  submitProviderReview,
  getProviderReviews,
};

