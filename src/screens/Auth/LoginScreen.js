// src/screens/Auth/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../api/authService';
import { COLORS } from '../../constants/colors';

const logo = require('../../../src/assests/images/DCS-logo.png.png');

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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
    const { user, error: loginError } = await authService.loginWithEmail(email, password);
    setIsLoading(false);
    if (loginError) {
      Alert.alert('Login Failed', loginError);
      setError(loginError);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* --- 1. Fixed Header Background (Behind) --- */}
      <View style={[styles.headerBackground, { paddingTop: insets.top, height: 240 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to continue</Text>
        </View>
      </View>

      {/* --- 2. Scrollable Form (On Top) --- */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, zIndex: 10 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Container (Overlapping) */}
          <View style={styles.logoContainer}>
             <View style={styles.logoCircle}>
               <Image source={logo} style={styles.logo} resizeMode="contain" />
             </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={{ marginTop: 40 }}> 
              {/* Spacer for Logo overlap */}
              
              <Input
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity style={styles.forgotPassContainer}>
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Login"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginButton}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Beige
  },
  // --- Header ---
  headerBackground: {
    backgroundColor: COLORS.primary, // Teal
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  headerContent: {
    marginTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  // --- Scroll & Layout ---
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 160, // Push content down to overlap header
    paddingBottom: 40,
  },
  // --- Logo ---
  logoContainer: {
    alignItems: 'center',
    marginBottom: -50, // Pulls the card underneath
    zIndex: 20, // Sit on top of card
    elevation: 10,
  },
  logoCircle: {
    backgroundColor: '#FFF',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  logo: {
    width: 70,
    height: 70,
  },
  // --- Card ---
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  forgotPassContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: 5,
  },
  forgotPassText: {
    color: COLORS.greyDark,
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 12,
  },
  // --- Footer ---
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLORS.greyDark,
    fontSize: 15,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default LoginScreen;