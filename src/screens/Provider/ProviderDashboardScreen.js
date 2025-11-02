// src/screens/Provider/ProviderDashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../api/bookingService';
import { COLORS } from '../../constants/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useIsFocused } from '@react-navigation/native';

const ProviderDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && isFocused) {
      fetchProviderBookings();
    }
  }, [user, isFocused]);

  const fetchProviderBookings = async () => {
    setIsLoading(true);
    setError(null);
    const { bookings: fetchedBookings, error: fetchError } =
      await bookingService.getProviderBookings(user.uid);

    if (fetchError) {
      setError(fetchError);
      Alert.alert('Error', 'Could not fetch your assigned bookings.');
    } else {
      setBookings(fetchedBookings);
    }
    setIsLoading(false);
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This will notify the client.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const { success, error } =
              await bookingService.updateBookingStatus(bookingId, 'cancelled');

            if (error) {
              Alert.alert('Error', 'Failed to cancel booking.');
            } else {
              Alert.alert('Success', 'Booking has been cancelled.');
              fetchProviderBookings(); // Refresh the list
            }
          },
        },
      ]
    );
  };

  // --- NEW FUNCTION TO MARK AS COMPLETED ---
  const handleCompleteBooking = (bookingId) => {
    Alert.alert(
      'Complete Booking',
      'Are you sure you want to mark this job as completed?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Complete',
          style: 'default',
          onPress: async () => {
            const { success, error } =
              await bookingService.updateBookingStatus(bookingId, 'completed');

            if (error) {
              Alert.alert('Error', 'Failed to update booking.');
            } else {
              Alert.alert('Success', 'Booking marked as completed.');
              fetchProviderBookings(); // Refresh the list
            }
          },
        },
      ]
    );
  };
  // --- END NEW FUNCTION ---

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderBookingCard = ({ item }) => {
    const isConfirmed = item.status === 'confirmed';

    return (
      <Card style={styles.bookingCard}>
        <Text style={styles.bookingTitle}>Booking Details</Text>
        <Text style={styles.bookingInfo}>
          Client: {item.clientName}
        </Text>
        <Text style={styles.bookingInfo}>
          Service: {item.serviceName}
        </Text>
        <Text style={styles.bookingInfo}>
          When: {item.scheduleTime.toLocaleString()}
        </Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {(item.status || 'Unknown').toUpperCase()}
          </Text>
        </View>

        {/* --- MODIFIED BUTTONS SECTION --- */}
        {isConfirmed && (
          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              onPress={() => handleCancelBooking(item.id)}
              style={[styles.cardButton, styles.cancelButton]}
              textStyle={styles.cancelButtonText}
              type="secondary"
            />
            {/* --- ADDED NEW BUTTON --- */}
            <Button
              title="Mark as Completed"
              onPress={() => handleCompleteBooking(item.id)}
              style={[styles.cardButton, styles.completeButton]}
              textStyle={styles.completeButtonText}
              type="primary"
            />
          </View>
        )}
        {/* --- END MODIFIED SECTION --- */}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.title}>Your Assigned Bookings</Text>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.errorText}>
              You have no upcoming bookings assigned.
            </Text>
          </View>
        }
        onRefresh={fetchProviderBookings}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F5DC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  listContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText || '#333333',
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.greyDark,
    fontSize: 16,
    textAlign: 'center',
  },
  bookingCard: {
    padding: 16,
    marginVertical: 8,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  bookingInfo: {
    fontSize: 16,
    color: COLORS.darkText,
    marginVertical: 4,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.greyLight,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // --- MODIFIED STYLES FOR BUTTONS ---
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Use space-between
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyLight,
    paddingTop: 16,
  },
  cardButton: {
    flex: 0.48, // Make buttons take slightly less than half
    marginHorizontal: 0, // Remove horizontal margin
    paddingVertical: 10,
  },
  cancelButton: {
    borderColor: COLORS.danger,
  },
  cancelButtonText: {
    color: COLORS.danger,
    fontSize: 14,
  },
  // --- NEW STYLES FOR COMPLETE BUTTON ---
  completeButton: {
    backgroundColor: COLORS.success, // Use success color
    borderColor: COLORS.success,
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: 14,
  },
  // --- END NEW STYLES ---
});

export default ProviderDashboardScreen;