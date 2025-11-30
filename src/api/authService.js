// src/api/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'; 
import { auth, firestoreDB } from './firebase'; 

const OTP_COLLECTION = 'otp_requests';

// --- YOUR VERIFIED KEYS ---
const EMAILJS_SERVICE_ID = 'service_ubampdm'; 
const EMAILJS_TEMPLATE_ID = 'template_4snio1k'; //
const EMAILJS_PUBLIC_KEY = 'IjGwE50SYxIfxPyoW';   
const EMAILJS_PRIVATE_KEY = 'p0TZEez0rI0Vojr82fgEP'; 
// --------------------------

const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

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

// --- OTP FUNCTIONS ---

const sendEmailOTP = async (email) => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    await setDoc(doc(firestoreDB, OTP_COLLECTION, email), {
      code: code,
      createdAt: new Date().toISOString()
    });

    console.log(`[DEV] OTP for ${email} is ${code}`);

    const expiryTime = new Date(Date.now() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const emailData = {
      service_id: EMAILJS_SERVICE_ID.trim(),
      template_id: EMAILJS_TEMPLATE_ID.trim(),
      user_id: EMAILJS_PUBLIC_KEY.trim(),
      accessToken: EMAILJS_PRIVATE_KEY.trim(),
      template_params: {
        email: email,         
        passcode: code,       
        time: expiryTime,     
      },
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (response.ok) {
        console.log("Email sent successfully!");
        return { success: true, error: null };
    } else {
        const text = await response.text();
        console.error("EmailJS Error:", text);
        return { success: false, error: "Email failed: " + text };
    }

  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: error.message };
  }
};

const verifyEmailOTP = async (email, code) => {
  try {
    const docRef = doc(firestoreDB, OTP_COLLECTION, email);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: "No OTP request found. Please resend code." };
    }

    const data = docSnap.data();
    if (String(data.code) !== String(code)) {
      return { success: false, error: "Invalid code. Please try again." };
    }

    await deleteDoc(docRef);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, error: error.message };
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const authService = {
  registerWithEmail,
  loginWithEmail,
  sendEmailOTP,
  verifyEmailOTP,
  logout,
  onAuthChange,
};