// src/api/profileService.js
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
  Timestamp, // Import Timestamp for date handling
} from 'firebase/firestore';
import { firestoreDB } from './firebase';

// CORRECTED: Match the collection name in your Firestore screenshot
const PROFILES_COLLECTION = 'users'; 
const REVIEWS_COLLECTION = 'reviews';

/**
 * Creates a new user profile document in Firestore after registration.
 * This is typically called right after FR-1 (User Registration).
 */
const createUserProfile = async (userId, profileData) => {
  // profileData should include { email, name, role: 'client' or 'provider' }
  try {
    const userDocRef = doc(firestoreDB, PROFILES_COLLECTION, userId);
    await setDoc(userDocRef, {
      ...profileData,
      createdAt: Timestamp.fromDate(new Date()), // Use Firestore Timestamp
    });
    console.log("Profile created successfully for:", userId);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error creating profile in Firestore:", error);
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
      // Convert Firestore Timestamps back to JS Dates if needed by the UI
      const profileData = docSnap.data();
      if (profileData.createdAt && profileData.createdAt.toDate) {
          profileData.createdAt = profileData.createdAt.toDate();
      }
      return { profile: { id: docSnap.id, ...profileData }, error: null };
    } else {
      // It's not an error if the profile doesn't exist, just return null
      console.warn(`No profile document found for userId: ${userId}`);
      return { profile: null, error: 'No such profile!' };
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
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
     console.error("Error updating user profile:", error);
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
      profileStatus: 'complete', // Optional: Mark profile as complete
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating provider details:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Deletes a user's profile document.
 * Note: This does NOT delete the Firebase Auth user.
 * Corresponds to FR-4 (Update/Delete Profile).
 */
const deleteUserProfileDocument = async (userId) => {
  try {
    const userDocRef = doc(firestoreDB, PROFILES_COLLECTION, userId);
    await deleteDoc(userDocRef);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting user profile document:", error);
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
      createdAt: Timestamp.fromDate(new Date()),
    });
    // TODO: You might also update the provider's average rating here (e.g., using a transaction or cloud function)
    return { reviewId: docRef.id, error: null };
  } catch (error) {
    console.error("Error submitting provider review:", error);
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
      // Consider adding orderBy('createdAt', 'desc') if needed
    );
    const querySnapshot = await getDocs(reviewsQuery);
    const reviews = querySnapshot.docs.map((doc) => {
         const data = doc.data();
         // Convert Timestamp
         if (data.createdAt && data.createdAt.toDate) {
             data.createdAt = data.createdAt.toDate();
         }
         return { id: doc.id, ...data };
    });
    return { reviews, error: null };
  } catch (error) {
    console.error("Error fetching provider reviews:", error);
    return { reviews: [], error: error.message };
  }
};

export const profileService = {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateProviderDetails,
  deleteUserProfileDocument, // Renamed for clarity
  submitProviderReview,
  getProviderReviews,
};

