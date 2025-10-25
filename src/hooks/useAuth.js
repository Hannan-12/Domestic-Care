// src/hooks/useAuth.js
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'; // 1. Import useCallback
import { authService } from '../api/authService';
import { profileService } from '../api/profileService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 2. NEW FUNCTION TO FETCH PROFILE ---
  // We put this in a useCallback so we can pass it to other screens
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setProfile(null);
      return;
    }
    
    setUser(authUser);
    console.log('useAuth: User found, fetching profile...', authUser.uid);
    try {
      const { profile: userProfile, error: profileFetchError } =
        await profileService.getUserProfile(authUser.uid);

      if (profileFetchError && profileFetchError !== 'No such profile!') {
        console.error('useAuth: Failed to fetch profile:', profileFetchError);
        setProfile(null);
      } else if (userProfile) {
        console.log('useAuth: Profile fetched successfully.');
        setProfile(userProfile);
      } else {
        console.warn('useAuth: User profile not found in database.');
        setProfile(null);
      }
    } catch (profileError) {
      console.error('useAuth: Unexpected error fetching profile:', profileError);
      setProfile(null);
    }
  }, []); // Empty dependency array

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (authUser) => {
      try {
        if (authUser) {
          await fetchProfile(authUser); // 3. Call our new function
        } else {
          console.log('useAuth: User is logged out.');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('useAuth: Critical error in onAuthChange:', error);
        setUser(null);
        setProfile(null);
      } finally {
        console.log('useAuth: Setting isLoading to false.');
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchProfile]); // 4. Add fetchProfile as a dependency

  // --- 5. NEW FUNCTION TO EXPOSE ---
  // This function allows other screens to trigger a profile refetch
  const refetchProfile = useCallback(async () => {
    if (user) {
      console.log('useAuth: Manual refetch triggered.');
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  // 6. Provide 'refetchProfile' in the context value
  const value = {
    user,
    profile,
    isLoggedIn: !!user,
    isLoading,
    refetchProfile, // <-- ADDED
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};