// src/screens/Profile/ProviderAvailabilityScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../api/profileService';
import AvailabilityCalendar from '../../components/profile/AvailabilityCalendar';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

/**
 * Screen for providers to manage their available days (FR-3)
 */
const ProviderAvailabilityScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize markedDates from the user's profile, or with an empty object
  const [markedDates, setMarkedDates] = useState(
    profile?.availability?.markedDates || {}
  );

  /**
   * Toggles a day between 'available' and 'unavailable'
   */
  const onDayPress = useCallback(
    (dateString) => {
      // Create a deep copy of the markedDates object
      const newMarkedDates = JSON.parse(JSON.stringify(markedDates));

      if (newMarkedDates[dateString]) {
        // Day is already marked, so un-mark it (remove it)
        delete newMarkedDates[dateString];
      } else {
        // Day is not marked, so mark it as available
        newMarkedDates[dateString] = {
          selected: true,
          selectedColor: COLORS.primary,
        };
      }
      setMarkedDates(newMarkedDates);
    },
    [markedDates]
  );

  const handleSaveChanges = async () => {
    if (!user) {
      Alert.alert('Error', 'You are not logged in.');
      return;
    }

    setIsLoading(true);
    const detailsToUpdate = {
      availability: {
        markedDates: markedDates,
        lastUpdated: new Date().toISOString(),
      },
    };

    const { success, error } = await profileService.updateProviderDetails(
      user.uid,
      detailsToUpdate
    );

    setIsLoading(false);

    if (error) {
      Alert.alert('Save Failed', error);
    } else {
      Alert.alert('Success', 'Your availability has been updated.');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Manage Availability</Text>
        <Text style={styles.subtitle}>
          Tap a day to mark it as 'Available'. Tap again to remove it.
        </Text>

        <AvailabilityCalendar
          markedDates={markedDates}
          onDayPress={onDayPress}
        />

        <Button
          title="Save Changes"
          onPress={handleSaveChanges}
          loading={isLoading}
          style={styles.saveButton}
        />
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
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.greyDark,
    marginBottom: 24,
  },
  saveButton: {
    marginTop: 32,
  },
});

export default ProviderAvailabilityScreen;