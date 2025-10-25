// src/screens/Profile/EditProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../api/profileService';
import { imageService } from '../../api/imageService'; // <-- 1. IMPORT NEW SERVICE
import { COLORS } from '../../constants/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const EditProfileScreen = ({ navigation }) => {
  const { user, profile, refetchProfile } = useAuth();

  const [name, setName] = useState(profile?.name || '');
  // avatarUrl state will now hold the Base64 string
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- 2. MODIFIED IMAGE PICKER FUNCTION ---
  const handlePickImage = async () => {
    setIsPickingImage(true);
    
    // 1. Get the Base64 string from the service
    const base64String = await imageService.pickAndCompressImageAsBase64();

    // 2. If user didn't cancel, update the state
    if (base64String) {
      setAvatarUrl(base64String);
      Alert.alert('Success', 'Profile picture selected. Tap "Save Changes".');
    }
    
    setIsPickingImage(false);
  };
  // --- END MODIFICATION ---

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    setIsLoading(true);

    const updatedData = {
      name: name,
      avatarUrl: avatarUrl, // <-- This now saves the Base64 string to Firestore
    };

    const { success, error } = await profileService.updateUserProfile(
      user.uid,
      updatedData
    );

    setIsLoading(false);

    if (error) {
      Alert.alert('Save Failed', error);
    } else {
      Alert.alert('Success', 'Your profile has been updated.');
      await refetchProfile();
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* --- 3. IMAGE UI (No logic change, just a loading state) --- */}
        <View style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={{
              // The Image component can render Base64 data URIs
              uri: avatarUrl || 'https://via.placeholder.com/100',
            }}
          />
          <TouchableOpacity
            style={styles.editButton}
            onPress={handlePickImage}
            disabled={isPickingImage}
          >
            <Text style={styles.editButtonText}>
              {isPickingImage ? 'Loading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Full Name"
          placeholder="Your full name"
          value={name}
          onChangeText={setName}
        />

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isLoading || isPickingImage}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- 4. STYLES (Simplified) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F5DC',
  },
  container: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.greyLight,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveButton: {
    marginTop: 32,
  },
});
export default EditProfileScreen;