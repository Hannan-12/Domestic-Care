// src/api/mapService.js
import { API_KEYS } from '../constants/apiKeys';

const GOOGLE_MAPS_API_KEY = API_KEYS.GOOGLE_MAPS_API_KEY;

/**
 * Fetches the Estimated Time of Arrival (ETA) between two points.
 * Corresponds to FR-11 (Estimated Arrival Time).
 *
 * @param {object} origin - { latitude: number, longitude: number }
 * @param {object} destination - { latitude: number, longitude: number }
 * @returns {object} - { duration: string, distance: string, error: string | null }
 */
const getEtaAndDistance = async (origin, destination) => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API Key is not set.');
    return { duration: null, distance: null, error: 'API key not configured.' };
  }

  const originStr = `${origin.latitude},${origin.longitude}`;
  const destStr = `${destination.latitude},${destination.longitude}`;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${originStr}&destinations=${destStr}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (json.status !== 'OK' || !json.rows[0]?.elements[0]) {
      throw new Error(json.error_message || 'Invalid response from Google Maps');
    }

    const element = json.rows[0].elements[0];

    if (element.status === 'OK') {
      return {
        duration: element.duration.text, // e.g., "15 mins"
        distance: element.distance.text, // e.g., "5.2 km"
        error: null,
      };
    } else {
      throw new Error(`Element status: ${element.status}`);
    }
  } catch (error) {
    return { duration: null, distance: null, error: error.message };
  }
};

/**
 * Converts a human-readable address into geographic coordinates.
 *
 * @param {string} address - e.g., "Air University, Islamabad, Pakistan"
 * @returns {object} - { location: { lat: number, lng: number }, error: string | null }
 */
const geocodeAddress = async (address) => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API Key is not set.');
    return { location: null, error: 'API key not configured.' };
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (json.status !== 'OK' || !json.results[0]) {
      throw new Error(json.error_message || 'Geocoding failed');
    }

    const location = json.results[0].geometry.location; // { lat: number, lng: number }
    return { location, error: null };
  } catch (error) {
    return { location: null, error: error.message };
  }
};

export const mapService = {
  getEtaAndDistance,
  geocodeAddress,
};