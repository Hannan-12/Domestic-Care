// src/hooks/useAuth.js
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
      if (authUser) {
        // User is logged in
        setUser(authUser);
        // Now fetch their profile data from Firestore
        const { profile: userProfile } = await profileService.getUserProfile(
          authUser.uid
        );
        setProfile(userProfile);
      } else {
        // User is logged out
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
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
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

/**
 * This is the custom hook.
 * Any component can call `const { user, isLoggedIn } = useAuth();`
 * to get the current authentication state.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};