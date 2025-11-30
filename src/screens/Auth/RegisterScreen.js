// src/screens/Auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView, Switch, Image
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../api/authService';
import { profileService } from '../../api/profileService';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth'; // Import useAuth to refresh profile

const logo = require('../../../src/assests/images/DCS-logo.png.png');

const RegisterScreen = ({ navigation }) => {
  const { refetchProfile } = useAuth(); // Get refetch function
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isProvider, setIsProvider] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // 1. Create User (Auto-Login happens here)
    const { user, error: authError } = await authService.registerWithEmail(email, password);

    if (authError) {
      setIsLoading(false);
      Alert.alert('Registration Failed', authError);
      return;
    }

    // 2. Save Profile with isEmailVerified = false
    const profileData = {
      email: user.email,
      name: name,
      role: isProvider ? 'provider' : 'client',
      isEmailVerified: false, // <--- CRITICAL
      createdAt: new Date(),
    };

    const { error: profileError } = await profileService.createUserProfile(user.uid, profileData);

    if (profileError) {
      setIsLoading(false);
      Alert.alert('Error', 'Account created but profile failed.');
      return;
    }

    // 3. Send OTP
    await authService.sendEmailOTP(email);

    // 4. Update App State
    // We trigger refetchProfile so AppNavigator sees the new profile (verified=false)
    // and automatically switches to the OTP Screen.
    await refetchProfile();
    
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <Input label="Full Name" placeholder="Your full name" value={name} onChangeText={setName} />
        <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Password" placeholder="Minimum 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
        <Input label="Confirm Password" placeholder="Repeat your password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Are you a Service Provider?</Text>
          <Switch
            trackColor={{ false: COLORS.grey, true: COLORS.primaryLight }}
            thumbColor={isProvider ? COLORS.primary : COLORS.greyLight}
            onValueChange={setIsProvider}
            value={isProvider}
          />
        </View>

        {error && <Text style={styles.generalError}>{error}</Text>}

        <Button title="Sign Up" onPress={handleRegister} loading={isLoading} style={styles.registerButton} />

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>
            Already have an account? <Text style={styles.linkText}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background || '#F5F5DC' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  logo: { width: 130, height: 130, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 15, color: COLORS.greyDark, textAlign: 'center', marginBottom: 20 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10, paddingHorizontal: 4 },
  switchLabel: { fontSize: 15, color: COLORS.darkText },
  registerButton: { marginTop: 12 },
  loginLink: { marginTop: 16, textAlign: 'center', color: COLORS.greyDark },
  linkText: { color: COLORS.primary, fontWeight: 'bold' },
  generalError: { color: COLORS.danger, textAlign: 'center', marginBottom: 8, fontSize: 14 },
});

export default RegisterScreen;