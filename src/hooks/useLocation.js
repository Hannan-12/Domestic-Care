// src/hooks/useLocation.js
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

/**
 * A custom hook to get the user's current GPS location.
 *
 * @returns {object} - { location: { latitude, longitude } | null, error: string | null, isLoading: boolean }
 */
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscriber;

    (async () => {
      // 1. Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      // 2. Get initial location quickly
      try {
        let initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation({
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
        });
      } catch (error) {
        setErrorMsg('Could not fetch initial location');
      } finally {
        setIsLoading(false);
      }
      
      // 3. Set up a real-time watcher for continuous updates (FR-9)
      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds (as per FR-9/BR-1)
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          });
        }
      );
    })();

    // Cleanup function: stop watching when the component unmounts
    return () => {
      if (subscriber) {
        subscriber.remove();
      }
    };
  }, []);

  return { location, error: errorMsg, isLoading };
};