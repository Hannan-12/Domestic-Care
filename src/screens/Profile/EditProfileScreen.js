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
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../api/profileService';
import { imageService } from '../../api/imageService';
import { COLORS } from '../../constants/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';

const EditProfileScreen = ({ navigation }) => {
  const { user, profile, refetchProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    setIsPickingImage(true);
    const base64String = await imageService.pickAndCompressImageAsBase64();
    if (base64String) {
      setAvatarUrl(base64String);
    }
    setIsPickingImage(false);
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    setIsLoading(true);

    const updatedData = {
      name: name,
      avatarUrl: avatarUrl, 
    };

    const { success, error } = await profileService.updateUserProfile(
      user.uid,
      updatedData
    );

    setIsLoading(false);

    if (error) {
      Alert.alert('Save Failed', error);
    } else {
      Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: async () => {
              await refetchProfile();
              navigation.goBack();
          }}
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- Header --- */}
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update your personal details</Text>

        {/* --- Avatar Picker --- */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} disabled={isPickingImage}>
            <Image
              style={styles.avatar}
              source={{
                uri: avatarUrl || 'https://via.placeholder.com/150',
              }}
            />
            <View style={styles.cameraBadge}>
               <Ionicons name="camera" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>
             {isPickingImage ? 'Processing...' : 'Tap to change photo'}
          </Text>
        </View>

        {/* --- Form --- */}
        <View style={styles.formContainer}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              style={styles.inputStyle}
            />
            
            {/* Email is typically read-only */}
            <View style={styles.readOnlyField}>
                <Text style={styles.label}>Email Address</Text>
                <Text style={styles.value}>{user?.email}</Text>
                <Ionicons name="lock-closed" size={16} color={COLORS.grey} style={{marginTop: 4}}/>
            </View>

            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={isLoading || isPickingImage}
              style={styles.saveButton}
            />
            
            <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkText,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.greyDark,
    textAlign: 'center',
    marginBottom: 30,
  },
  
  // --- Avatar ---
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  changePhotoText: {
    marginTop: 12,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // --- Form ---
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputStyle: {
    marginBottom: 10,
  },
  readOnlyField: {
    marginBottom: 24,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  label: {
    fontSize: 12,
    color: COLORS.greyDark,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: COLORS.grey,
  },
  
  saveButton: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
  },
  cancelText: {
    color: COLORS.greyDark,
    fontSize: 16,
  },
});

export default EditProfileScreen;