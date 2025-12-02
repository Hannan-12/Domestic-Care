// src/screens/Profile/UserProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
// 1. Import useSafeAreaInsets to fix the status bar overlap issue
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../api/authService';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const UserProfileScreen = ({ navigation }) => {
  const { profile, user, isLoading } = useAuth();
  // 2. Get safe area insets
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', onPress: async () => await authService.logout(), style: 'destructive' },
    ]);
  };

  const ProfileMenuItem = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItemCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.greyDark} />
      </View>
    </TouchableOpacity>
  );

  if (isLoading || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isProvider = profile?.role === 'provider';

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* --- 3. Dynamic Header (Fixes "Profile" word hiding) --- */}
      <View style={[styles.headerBackground, { paddingTop: insets.top + 10, height: 180 + insets.top }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: 160 }]} // Push content down
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- 4. Profile Section (Avatar moved OUTSIDE card to fix clipping) --- */}
        <View style={styles.profileSection}>
          
          {/* Avatar - Sits on TOP (ZIndex High) */}
          <View style={styles.avatarWrapper}>
            <Image
              style={styles.avatar}
              source={{ uri: profile?.avatarUrl || 'https://via.placeholder.com/150' }}
            />
            <TouchableOpacity 
              style={styles.editBadge}
              onPress={() => navigation.navigate('EditProfileScreen')}
            >
              <Ionicons name="pencil" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Card - Sits BELOW Avatar */}
          <View style={styles.profileCard}>
            <View style={{ marginTop: 50 }}> 
              {/* Spacer inside card to accommodate the avatar overlapping from top */}
              <Text style={styles.name}>{profile?.name || 'User Name'}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              
              {isProvider && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>Service Provider</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* --- Menu Options --- */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>GENERAL</Text>
          
          <ProfileMenuItem
            icon="person-outline"
            label="Edit Profile Details"
            onPress={() => navigation.navigate('EditProfileScreen')}
          />
          
          {isProvider && (
            <>
              <ProfileMenuItem
                icon="calendar-outline"
                label="Manage Availability"
                onPress={() => navigation.navigate('ProviderAvailability')}
              />
              <ProfileMenuItem
                icon="construct-outline"
                label="Manage Skills"
                onPress={() => navigation.navigate('ProviderSkills')}
              />
            </>
          )}

          <ProfileMenuItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => {}}
          />
          <ProfileMenuItem
            icon="settings-outline"
            label="App Settings"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Domestic Care App v1.0.0</Text>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Beige
  },
  centered: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
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
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  // --- Scroll Content ---
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // --- Profile Section ---
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 10, // Ensure this sits above everything else
  },
  avatarWrapper: {
    zIndex: 20, // Higher than card
    marginBottom: -50, // Pulls the card UP to overlap
    elevation: 10, // Android shadow/layering
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFF',
    backgroundColor: COLORS.greyLight,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary, // Mustard
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 10, // Internal padding
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1, // Lower than avatar
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: COLORS.greyDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: '#E0F2F1', // Light Teal
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  roleText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // --- Section ---
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.greyDark,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // --- Menu Item ---
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkText,
    fontWeight: '500',
  },
  arrowContainer: {
    opacity: 0.5,
  },
  // --- Logout ---
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.danger || '#D9534F',
  },
  logoutText: {
    color: COLORS.danger || '#D9534F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 20,
  },
});

export default UserProfileScreen;