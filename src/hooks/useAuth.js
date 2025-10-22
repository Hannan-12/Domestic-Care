import React, { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../api/authService';
import { profileService } from '../api/profileService';

// Create a context to hold the auth state
const AuthContext = createContext();

/**
 * This is the provider component. Wrap your entire app in this
 * (e.g., in App.js) to make the auth state available everywhere.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // The Firebase auth user object
  const [profile, setProfile] = useState(null); // The user's profile from Firestore
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthChange returns an "unsubscribe" function
    const unsubscribe = authService.onAuthChange(async (authUser) => {
      // Use try...catch...finally to handle all cases
      try {
        if (authUser) {
          // User is logged in
          setUser(authUser);
          console.log('useAuth: User found, fetching profile...', authUser.uid);
          
          // Now fetch their profile data from Firestore
          // This call must be wrapped in its own try/catch in case ONLY it fails
          try {
            const { profile: userProfile } = await profileService.getUserProfile(
              authUser.uid
            );

            if (userProfile) {
              console.log('useAuth: Profile fetched successfully.');
              setProfile(userProfile);
            } else {
              console.warn('useAuth: User profile not found in database.');
              setProfile(null); // Set to null, not an error
            }
          } catch (profileError) {
            console.error('useAuth: Failed to fetch profile:', profileError);
            setProfile(null); // Set profile to null if fetch fails
          }
        } else {
          // User is logged out
          console.log('useAuth: User is logged out.');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        // Catch any other unexpected errors
        console.error('useAuth: Critical error in onAuthChange:', error);
        setUser(null);
        setProfile(null);
      } finally {
        // THIS IS THE MOST IMPORTANT PART
        // It runs no matter what, ensuring the app never hangs
        console.log('useAuth: Setting isLoading to false.');
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // The value provided to consuming components
  const value = {
    user,
    profile,
    isLoggedIn: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* This is a good pattern, but you can also let the child 
        screen decide what to show based on isLoading.
        Your original code is fine:
      */}
      {!isLoading && children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};
