// src/api/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithPopup, // Or signInWithRedirect
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase'; // Import the initialized auth object


const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Send email verification (part of FR-2) [cite: 265]
    await sendEmailVerification(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * FR-1: Sign in an existing user with email and password
 * [cite: 263]
 */
const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * FR-1 & CON-6: Sign in with a phone number (sends OTP)
 * [cite: 144, 263]
 * Note: This requires a reCAPTCHA verifier, which needs setup in your UI code.
 * This function returns the confirmationResult object to be used for verifying the code.
 */
const signInWithPhoneNumber = async (phoneNumber, appVerifier) => {
  try {
    const phoneProvider = new PhoneAuthProvider(auth);
    const confirmationResult = await phoneProvider.verifyPhoneNumber(
      phoneNumber,
      appVerifier
    );
    // The UI will now prompt the user to enter the OTP
    return { confirmationResult, error: null };
  } catch (error) {
    return { confirmationResult: null, error: error.message };
  }
};

/**
 * FR-2: Verify the OTP code sent to the user's phone
 * [cite: 265]
 */
const confirmPhoneNumberOTP = async (confirmationResult, otpCode) => {
  try {
    const userCredential = await confirmationResult.confirm(otpCode);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * FR-1: Sign in with Google (Social Login)
 * [cite: 263]
 */
const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // This will open a popup or redirect.
    // For React Native, you'd typically use @react-native-google-signin/google-signin
    // This is a simplified web-based example.
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Sign out the current user
 */
const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Listen for authentication state changes
 */
const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const authService = {
  registerWithEmail,
  loginWithEmail,
  signInWithPhoneNumber,
  confirmPhoneNumberOTP,
  signInWithGoogle,
  logout,
  onAuthChange,
};