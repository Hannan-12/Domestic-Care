import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../api/profileService';
import { imageService } from '../../api/imageService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const ProviderVerificationScreen = ({ navigation }) => {
  const { user, profile, refetchProfile } = useAuth();
  const [fatherName, setFatherName] = useState(profile?.fatherName || '');
  const [cnic, setCnic] = useState(profile?.cnic || '');
  const [frontPhoto, setFrontPhoto] = useState(profile?.cnicFront || null);
  const [backPhoto, setBackPhoto] = useState(profile?.cnicBack || null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async (setFunc) => {
    try {
      const base64 = await imageService.pickAndCompressImageAsBase64();
      if (base64) setFunc(base64);
    } catch (e) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!fatherName || !cnic || !frontPhoto || !backPhoto) {
      Alert.alert('Incomplete', 'Please fill all fields and upload both CNIC photos.');
      return;
    }

    setIsLoading(true);
    
    // Requirement 6: Submit for Admin Approval
    const verificationData = {
      fatherName,
      cnic,
      cnicFront: frontPhoto,
      cnicBack: backPhoto,
      isVerified: false, // Must be set to true by Admin
      verificationStatus: 'pending', // pending, approved, rejected
      submittedAt: new Date().toISOString()
    };

    const { success, error } = await profileService.updateProviderDetails(user.uid, verificationData);
    
    setIsLoading(false);

    if (success) {
      await refetchProfile();
      Alert.alert(
        'Submission Successful',
        'Your documents have been sent to the Admin. You will be notified once approved.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Identity Verification</Text>
        <Text style={styles.subtitle}>
          To provide services, please verify your identity. This information is shared only with the Admin.
        </Text>

        <Input 
          label="Father's Name" 
          placeholder="As per CNIC" 
          value={fatherName} 
          onChangeText={setFatherName} 
        />
        
        <Input 
          label="CNIC Number" 
          placeholder="e.g., 12345-1234567-1" 
          value={cnic} 
          onChangeText={setCnic} 
          keyboardType="numeric"
        />

        <Text style={styles.sectionHeader}>CNIC Photos</Text>
        
        <View style={styles.photoContainer}>
          <TouchableOpacity onPress={() => pickImage(setFrontPhoto)} style={styles.photoBox}>
            {frontPhoto ? (
              <Image source={{ uri: frontPhoto }} style={styles.photo} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="camera-outline" size={30} color={COLORS.greyDark} />
                <Text style={styles.photoText}>Front Side</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => pickImage(setBackPhoto)} style={styles.photoBox}>
            {backPhoto ? (
              <Image source={{ uri: backPhoto }} style={styles.photo} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="camera-outline" size={30} color={COLORS.greyDark} />
                <Text style={styles.photoText}>Back Side</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Button 
          title="Submit for Approval" 
          onPress={handleSubmit} 
          loading={isLoading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.greyDark, marginBottom: 24 },
  sectionHeader: { fontSize: 16, fontWeight: '600', color: COLORS.darkText, marginTop: 16, marginBottom: 12 },
  photoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  photoBox: { 
    width: '48%', 
    height: 120, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: COLORS.grey, 
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: COLORS.white
  },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoText: { marginTop: 8, color: COLORS.greyDark, fontSize: 12 },
  submitBtn: { marginTop: 16 }
});

export default ProviderVerificationScreen;