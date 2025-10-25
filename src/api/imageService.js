// src/api/imageService.js
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Asks for permission to access the media library.
 * @returns {boolean} - True if permission granted, false otherwise.
 */
const getMediaPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Denied',
      'Sorry, we need camera roll permissions to make this work!'
    );
    return false;
  }
  return true;
};

/**
 * Picks, compresses, and converts an image to a Base64 string.
 * This is the "automatic" solution that saves to Firestore.
 * @returns {string | null} - The Base64 data URI (e.g., "data:image/jpeg;base64,...") or null.
 */
const pickAndCompressImageAsBase64 = async () => {
  const hasPermission = await getMediaPermission();
  if (!hasPermission) return null;

  // 1. Pick image
  let pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1], // Square aspect ratio
  });

  if (pickerResult.canceled) {
    return null;
  }

  const imageUri = pickerResult.assets[0].uri;

  // 2. Compress image and get Base64
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 400 } }], // Resize to 400px wide
      {
        compress: 0.7, // Compress to 70% quality
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true, // <-- This is the magic!
      }
    );

    // 3. Return the Base64 string with the data URI prefix
    return `data:image/jpeg;base64,${manipResult.base64}`;
  } catch (error) {
    console.error('Error compressing image: ', error);
    Alert.alert('Error', 'Could not process the image.');
    return null;
  }
};

export const imageService = {
  pickAndCompressImageAsBase64,
};