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

const logo = require('/Users/muhammadhannanhafeez/React native /Domestic-Care/src/assests/images/DCS-logo.png.png');

const RegisterScreen = ({ navigation }) => {
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
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { user, error: authError } = await authService.registerWithEmail(
      email,
      password
    );

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
      console.error("Error creating profile:", profileError);
      Alert.alert(
        'Registration Error',
        'Your account was created, but we failed to save your profile. Please contact support.'
      );
      setError(profileError);
    } else {
      console.log('Registered new user:', user.uid);
      Alert.alert(
        'Success',
        'Your account has been created. Please check your email to verify your account.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <Input
          label="Full Name"
          placeholder="Your full name"
          value={name}
          onChangeText={setName}
          error={error && error.includes('name') ? error : null}
        />

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={error && (error.includes('email') || error.includes('valid')) ? error : null}
        />

        <Input
          label="Password"
          placeholder="Minimum 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={error && (error.includes('password') || error.includes('6 characters')) ? error : null}
        />

        <Input
          label="Confirm Password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={error && error.includes('match') ? error : null}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Are you a Service Provider?</Text>
          <Switch
            trackColor={{ false: COLORS.grey, true: COLORS.primaryLight }}
            thumbColor={isProvider ? COLORS.primary : COLORS.greyLight}
            onValueChange={setIsProvider}
            value={isProvider}
          />
        </View>

        {error && !(error.includes('name') || error.includes('email') || error.includes('password') || error.includes('match') || error.includes('6 characters') || error.includes('valid')) && (
          <Text style={styles.generalError}>{error}</Text>
        )}

        <Button
          title="Sign Up"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.registerButton}
        />

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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F5DC',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 24,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.darkText || '#333333',
  },
  registerButton: {
    marginTop: 16,
  },
  loginLink: {
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
    fontSize: 14,
  },
});

export default RegisterScreen;
