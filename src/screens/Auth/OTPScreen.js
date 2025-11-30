// src/screens/Auth/OTPScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Alert, SafeAreaView, TextInput, TouchableOpacity
} from 'react-native';
import { authService } from '../../api/authService';
import { profileService } from '../../api/profileService'; // Import profile service
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

const OTPScreen = ({ route, navigation }) => {
  const { user, refetchProfile } = useAuth();
  
  // If we came from Login/Register (logged in), get email from user object
  // If we came from elsewhere, check params
  const email = user?.email || route.params?.email;
  
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true);

    // 1. Verify Code
    const { success, error } = await authService.verifyEmailOTP(email, otpCode);

    if (!success) {
      setIsLoading(false);
      Alert.alert('Verification Failed', error);
      return;
    }

    // 2. If Logged In, update Profile to "Verified"
    if (user) {
        const { error: updateError } = await profileService.updateUserProfile(user.uid, {
            isEmailVerified: true
        });

        if (updateError) {
             Alert.alert("Error", "Code correct, but failed to update profile status.");
             setIsLoading(false);
             return;
        }

        // 3. Refresh Profile -> AppNavigator will see verified=true and switch to Home
        await refetchProfile();
        // No need to navigate(); AppNavigator handles the switch automatically
    } else {
        // Fallback for logged out flow (e.g. Forgot Password flow)
        Alert.alert("Success", "Email verified. Please log in.");
        navigation.navigate("Login");
    }
    
    setIsLoading(false);
  };

  const handleResend = async () => {
      setIsLoading(true);
      await authService.sendEmailOTP(email);
      setIsLoading(false);
      Alert.alert("Sent", "New code sent.");
  };

  const handleLogout = async () => {
      await authService.logout();
      // AppNavigator will switch to AuthStack -> Login
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to:</Text>
        <Text style={styles.emailText}>{email}</Text>

        <TextInput
          style={styles.otpInput}
          value={otpCode}
          onChangeText={setOtpCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
          placeholderTextColor={COLORS.grey}
        />

        <Button
          title="Verify Code"
          onPress={handleVerify}
          loading={isLoading}
          style={styles.verifyButton}
        />

        <TouchableOpacity onPress={handleResend} disabled={isLoading}>
          <Text style={styles.resendLink}>
            Didn't receive a code? <Text style={styles.linkText}>Resend</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={{marginTop: 30}}>
            <Text style={{textAlign: 'center', color: COLORS.danger}}>Log Out / Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background || '#F5F5DC' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.greyDark, textAlign: 'center' },
  emailText: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText, textAlign: 'center', marginBottom: 32, marginTop: 5 },
  otpInput: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.grey, borderRadius: 8, padding: 16, fontSize: 24, textAlign: 'center', letterSpacing: 10, marginBottom: 24 },
  verifyButton: { marginTop: 16 },
  resendLink: { marginTop: 24, textAlign: 'center', color: COLORS.greyDark },
  linkText: { color: COLORS.primary, fontWeight: 'bold' },
});

export default OTPScreen;