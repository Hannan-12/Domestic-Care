import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView, // Removed deprecated SafeAreaView
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
// NEW IMPORT
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../api/authService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

/**
 * User Profile Screen (Module 1)
 *
 * @param {object} props
 * @param {object} props.navigation - React Navigation prop
 */
const UserProfileScreen = ({ navigation }) => {
  const { profile, user, isLoading } = useAuth();

  const handleLogout = async () => {
    // ... (your existing logout logic is fine)
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        onPress: async () => {
          await authService.logout();
          // The onAuthChange listener will handle navigation to the AuthStack
        },
        style: 'destructive',
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle case where user is logged in but has no profile data
  // (This is what you are seeing now due to the Firestore error)
  if (!profile && user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.email}>Welcome {user.email}</Text>
          <Text style={styles.errorText}>Could not load profile data.</Text>
          <Text style={styles.errorText}>
            (This may be a network or permissions issue).
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle case where user is fully logged out
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>Not logged in.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    // Use edges to ignore the bottom safe area for the scroll view
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            style={styles.avatar}
            source={{ uri: profile.avatarUrl || 'https://via.placeholder.com/100' }}
          />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card style={styles.menuCard}>
          <ProfileMenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => navigation.navigate('EditProfileScreen')}
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

const ProfileMenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={COLORS.primary} />
    <Text style={styles.menuLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={24} color={COLORS.grey} />
  </TouchableOpacity>
);

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
  menuCard: {
    paddingVertical: 8,
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
    marginTop: 32,
    borderColor: COLORS.danger,
  },
  // ADDED THIS STYLE
  errorText: {
    fontSize: 14,
    color: COLORS.greyDark,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default UserProfileScreen;

