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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../api/authService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

/**
 * User Profile Screen (Module 1)
 * Now conditionally shows provider-specific options.
 *
 * @param {object} props
 * @param {object} props.navigation - React Navigation prop
 */
const UserProfileScreen = ({ navigation }) => {
  const { profile, user, isLoading } = useAuth(); // No change here

  const handleLogout = async () => {
    // ... (your existing logout logic is fine)
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        onPress: async () => {
          await authService.logout();
        },
        style: 'destructive',
      },
    ]);
  };

  // Helper component for menu items (no change)
  const ProfileMenuItem = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={COLORS.primary} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={24} color={COLORS.grey} />
    </TouchableOpacity>
  );

  // Loading state (no change)
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Profile error state (no change)
  if (!profile && user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.email}>Welcome {user.email}</Text>
          <Text style={styles.errorText}>Could not load profile data.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Logged out state (no change)
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>Not logged in.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // <-- 1. CHECK THE USER'S ROLE
  const isProvider = profile.role === 'provider';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            style={styles.avatar}
            source={{
              uri: profile.avatarUrl || 'https://via.placeholder.com/100',
            }}
          />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {/* 2. SHOW ROLE BADGE (Optional but helpful) */}
          {isProvider && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Provider Account</Text>
            </View>
          )}
        </View>

        {/* <-- 3. PROVIDER-SPECIFIC MENU --> */}
        {isProvider && (
          <Card style={styles.menuCard}>
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
          </Card>
        )}
        {/* <-- END OF PROVIDER MENU --> */}

        <Card style={styles.menuCard}>
          <ProfileMenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => {
              /* navigation.navigate('EditProfileScreen') */
            }}
          />
          <ProfileMenuItem
            icon="settings-outline"
            label="Settings"
            onPress={() => {
              /* Navigate to Settings */
            }}
          />
          <ProfileMenuItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => {
              /* Navigate to Notifications */
            }}
          />
        </Card>

        <Button
          title="Log Out"
          onPress={handleLogout}
          style={styles.logoutButton}
          type="secondary"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES (with additions) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F5DC',
  },
  container: {
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.greyLight,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  email: {
    fontSize: 16,
    color: COLORS.greyDark,
    marginTop: 4,
  },
  // <-- 4. NEW STYLES FOR ROLE BADGE
  roleBadge: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  roleText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // <-- END NEW STYLES
  menuCard: {
    paddingVertical: 8,
    marginBottom: 16, // Add margin between cards
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyLight,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkText,
    marginLeft: 16,
  },
  logoutButton: {
    marginTop: 16, // Reduced margin
    borderColor: COLORS.danger,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.greyDark,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default UserProfileScreen;