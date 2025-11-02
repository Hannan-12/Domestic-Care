import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../api/authService';
import { profileService } from '../../api/profileService';
import { COLORS } from '../../constants/colors';
// We no longer need useAuth here since we are not refetching the profile
// import { useAuth } from '../../hooks/useAuth';

const logo = require('../../../src/assests/images/DCS-logo.png.png');

const RegisterScreen = ({ navigation }) => {
  // const { refetchProfile } = useAuth(); // No longer needed
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isProvider, setIsProvider] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- MODIFIED FUNCTION ---
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { user, error: authError } = await authService.registerWithEmail(email, password);

    if (authError) {
      setIsLoading(false);
      if (authError.includes('auth/email-already-in-use')) {
        Alert.alert('Registration Failed', 'This email address is already registered.');
      } else if (authError.includes('auth/invalid-email')) {
        Alert.alert('Registration Failed', 'Please enter a valid email address.');
      } else {
        Alert.alert('Registration Failed', authError);
      }
      setError(authError);
      return;
    }

    const profileData = {
      email: user.email,
      name: name,
      role: isProvider ? 'provider' : 'client',
      createdAt: new Date(),
    };

    const { success, error: profileError } =
      await profileService.createUserProfile(user.uid, profileData);

    if (profileError) {
      setIsLoading(false);
      console.error('Error creating profile:', profileError);
      Alert.alert(
        'Registration Error',
        'Your account was created, but we failed to save your profile. Please contact support.'
      );
      setError(profileError);
      return;
    }

    // --- THIS IS THE FIX ---
    console.log('Registered new user:', user.uid);
    
    // 1. Log out the user. This prevents automatic login.
    await authService.logout();
    
    // 2. Stop the loading indicator
    setIsLoading(false);

    // 3. Alert the user and navigate to Login on press
    Alert.alert(
      'Success',
      'Your account has been created. Please log in.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );
  };
  // --- END MODIFICATION ---

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

// --- STYLES (NO CHANGE) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F5DC',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 130,
    height: 130,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary || '#006270',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.greyDark || '#555555',
    textAlign: 'center',
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: 15,
    color: COLORS.darkText || '#333333',
  },
  registerButton: {
    marginTop: 12,
  },
  loginLink: {
    marginTop: 16,
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
    marginBottom: 8,
    fontSize: 14,
  },
});

export default RegisterScreen;