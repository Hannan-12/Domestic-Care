// src/screens/Auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../api/authService';
import { profileService } from '../../api/profileService';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

const logo = require('../../../src/assests/images/DCS-logo.png.png');

const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { refetchProfile } = useAuth();
  
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

    const { user, error: authError } = await authService.registerWithEmail(email, password);
    if (authError) {
      setIsLoading(false);
      Alert.alert('Registration Failed', authError);
      return;
    }

    const profileData = {
      email: user.email,
      name: name,
      role: isProvider ? 'provider' : 'client',
      isEmailVerified: false,
      createdAt: new Date(),
    };

    const { error: profileError } = await profileService.createUserProfile(user.uid, profileData);
    if (profileError) {
      setIsLoading(false);
      Alert.alert('Error', 'Profile creation failed.');
      return;
    }

    await authService.sendEmailOTP(email);
    await refetchProfile();
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* --- Fixed Header --- */}
      <View style={[styles.headerBackground, { paddingTop: insets.top, height: 240 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join Domestic Care Services</Text>
        </View>
      </View>

      {/* --- Scrollable Content --- */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, zIndex: 10 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Logo Container */}
          <View style={styles.logoContainer}>
             <View style={styles.logoCircle}>
               <Image source={logo} style={styles.logo} resizeMode="contain" />
             </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
             <View style={{ marginTop: 40 }}>
                <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} />
                <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
                <Input label="Password" placeholder="Min 6 chars" value={password} onChangeText={setPassword} secureTextEntry />
                <Input label="Confirm Password" placeholder="Repeat password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

                <View style={styles.roleContainer}>
                    <View style={{flex: 1}}>
                       <Text style={styles.roleTitle}>Service Provider Account</Text>
                       <Text style={styles.roleDesc}>Enable to offer services.</Text>
                    </View>
                    <Switch
                      trackColor={{ false: '#E0E0E0', true: COLORS.secondary }}
                      thumbColor={isProvider ? COLORS.primary : '#F5F5F5'}
                      onValueChange={setIsProvider}
                      value={isProvider}
                    />
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Button 
                    title="Sign Up" 
                    onPress={handleRegister} 
                    loading={isLoading} 
                    style={styles.registerButton} 
                />
             </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  headerBackground: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 0,
  },
  headerContent: { marginTop: 40, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 160,
    paddingBottom: 40,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: -50,
    zIndex: 20,
    elevation: 10,
  },
  logoCircle: {
    backgroundColor: '#FFF',
    width: 90, height: 90,
    borderRadius: 45,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
  },
  logo: { width: 60, height: 60 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    zIndex: 1,
  },

  roleContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F9F9F9', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EEE', marginVertical: 10,
  },
  roleTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.darkText },
  roleDesc: { fontSize: 11, color: COLORS.greyDark, marginTop: 2 },

  errorText: { color: COLORS.danger, textAlign: 'center', marginBottom: 10, fontSize: 14 },
  registerButton: { marginTop: 8, borderRadius: 12 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: COLORS.greyDark, fontSize: 15 },
  footerLink: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
});

export default RegisterScreen;