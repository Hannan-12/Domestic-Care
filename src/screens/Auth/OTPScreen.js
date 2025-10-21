// src/screens/Auth/OTPScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { authService } from '../../api/authService';
import { app } from '../../api/firebase'; // We need the 'app' export for reCAPTCHA
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

/**
 * OTP Verification Screen (FR-2)
 *
 * @param {object} props
 * @param {object} props.navigation - React Navigation prop
 * @param {object} props.route - React Navigation prop (to get params)
 */
const OTPScreen = ({ route, navigation }) => {
  // const { phoneNumber } = route.params; // Get phone number from previous screen
  const recaptchaVerifier = useRef(null);
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // This is a mock phone number. In a real app, you'd pass this
  // from the Login or Register screen.
  const phoneNumber = '+923001234567'; // EXAMPLE ONLY

  // Send the OTP as soon as the screen loads
  useEffect(() => {
    sendVerification();
  }, []);

  const sendVerification = async () => {
    try {
      setIsLoading(true);
      const { confirmationResult, error } =
        await authService.signInWithPhoneNumber(
          phoneNumber,
          recaptchaVerifier.current
        );

      if (error) {
        throw new Error(error);
      }
      setConfirmationResult(confirmationResult);
      Alert.alert('OTP Sent', `An SMS code has been sent to ${phoneNumber}`);
    } catch (error) {
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCode = async () => {
    if (!confirmationResult) {
      setError('Please request an OTP first.');
      return;
    }
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { user, error } = await authService.confirmPhoneNumberOTP(
      confirmationResult,
      otpCode
    );

    setIsLoading(false);

    if (error) {
      Alert.alert('Verification Failed', error);
      setError(error);
    } else {
      // Success! onAuthChange will handle navigation
      console.log('Phone number verified for user:', user.uid);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        // Use this for invisible reCAPTCHA
        invisible={true}
      />

      <View style={styles.container}>
        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          Please enter the 6-digit code sent to {phoneNumber}
        </Text>

        <TextInput
          style={styles.otpInput}
          value={otpCode}
          onChangeText={setOtpCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
          placeholderTextColor={COLORS.grey}
        />

        {error && <Text style={styles.generalError}>{error}</Text>}

        <Button
          title="Verify Code"
          onPress={confirmCode}
          loading={isLoading}
          style={styles.verifyButton}
        />

        <TouchableOpacity onPress={sendVerification} disabled={isLoading}>
          <Text style={styles.resendLink}>
            Didn't receive a code? <Text style={styles.linkText}>Resend</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.resendLink}>
            <Text style={styles.linkText}>Back to Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F5DC',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary || '#006270',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.greyDark || '#555555',
    textAlign: 'center',
    marginBottom: 32,
  },
  otpInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: 24,
  },
  verifyButton: {
    marginTop: 16,
  },
  resendLink: {
    marginTop: 24,
    textAlign: 'center',
    color: COLORS.greyDark || '#555555',
  },
  linkText: {
    color: COLORS.primary || '#006270',
    fontWeight: 'bold',
  },
  generalError: {
    color: COLORS.danger || '#D9534F',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default OTPScreen;