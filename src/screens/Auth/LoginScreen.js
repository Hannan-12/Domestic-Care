import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Image, // Import the Image component
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../api/authService';
import { COLORS } from '../../constants/colors';

// Assume the logo is placed in an assets folder relative to this file.
// If 'DCS-logo.png.png' is in 'src/assets/images/', this path should work.
// Please adjust this path if your logo is saved in a different location.
const logo = require('../../../src/assests/images/DCS-logo.png.png');

/**
 * Login Screen (FR-1)
 *
 * @param {object} props
 * @param {object} props.navigation - React Navigation prop
 */
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { user, error: loginError } = await authService.loginWithEmail(
      email,
      password
    );

    setIsLoading(false);

    if (loginError) {
      Alert.alert('Login Failed', loginError);
      setError(loginError);
    } else {
      // The onAuthChange listener in useAuth.js will handle
      // the navigation to the main app.
      console.log('Logged in user:', user.uid);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* --- Logo Added Here --- */}
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        {/* ----------------------- */}

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Log in to your Domestic Care account
        </Text>

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={error && error.includes('email') ? error : null}
        />

        <Input
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={error && error.includes('password') ? error : null}
        />

        {error && !error.includes('email') && !error.includes('password') && (
          <Text style={styles.generalError}>{error}</Text>
        )}

        <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.loginButton}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>
            Don't have an account? <Text style={styles.linkText}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

        {/* TODO: Add Social Logins (Google, Phone) here */}
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
  // --- Style for the logo ---
  logo: {
    width: 150, // You can adjust this width
    height: 150, // You can adjust this height
    alignSelf: 'center',
    marginBottom: 24,
  },
  // --------------------------
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
  loginButton: {
    marginTop: 16,
  },
  registerLink: {
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

export default LoginScreen;
