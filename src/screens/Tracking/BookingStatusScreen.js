// src/screens/Tracking/BookingStatusScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../api/bookingService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button'; // <-- IMPORT Button
import { COLORS } from '../../constants/colors';
import { useIsFocused } from '@react-navigation/native';

const BookingStatusScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && isFocused) {
      fetchUserBookings();
    }
  }, [user, isFocused]);

  const fetchUserBookings = async () => {
    setIsLoading(true);
    setError(null);
    const { bookings: fetchedBookings, error: fetchError } =
      await bookingService.getUserBookings(user.uid);

    if (fetchError) {
      setError(fetchError);
      Alert.alert('Error', 'Could not fetch your bookings.');
    } else {
      setBookings(fetchedBookings);
    }
    setIsLoading(false);
  };

  const handleBookingPress = (booking) => {
    if (booking.status === 'in-progress' || booking.status === 'confirmed') {
      if (booking.providerId) {
        navigation.navigate('LiveTrackingScreen', {
          bookingId: booking.id,
          providerId: booking.providerId,
        });
      } else {
        Alert.alert('Error', 'Provider information is missing for this booking.');
      }
    }
  };

  // --- NEW FUNCTION ---
  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
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
              fetchUserBookings(); // Refresh the list
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

  // --- MODIFIED RENDER FUNCTION ---
  const renderBookingCard = ({ item }) => {
    const displayDate =
      item.scheduleTime instanceof Date
        ? item.scheduleTime.toLocaleString()
        : 'Invalid Date';

    // Only show "Cancel" or "Track" buttons if the booking is 'confirmed'
    const isConfirmed = item.status === 'confirmed';

    return (
      <Card style={styles.bookingCard}>
        <View style={styles.bookingDetails}>
          <Text style={styles.bookingService}>{item.serviceName}</Text>
          <View style={styles.detailRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color={COLORS.greyDark}
            />
            <Text style={styles.bookingProvider}>
              {item.providerName || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={COLORS.greyDark}
            />
            <Text style={styles.bookingDate}>{displayDate}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, getStatusColor(item.status)]}>
            {(item.status || 'Unknown').toUpperCase()}
          </Text>
        </View>

        {/* --- NEW BUTTONS SECTION --- */}
        {isConfirmed && (
          <View style={styles.buttonRow}>
            <Button
              title="Track"
              onPress={() => handleBookingPress(item)}
              style={styles.cardButton}
              textStyle={styles.cardButtonText}
            />
            <Button
              title="Cancel"
              onPress={() => handleCancelBooking(item.id)}
              style={[styles.cardButton, styles.cancelButton]}
              textStyle={styles.cancelButtonText}
              type="secondary"
            />
          </View>
        )}
        {/* --- END NEW BUTTONS SECTION --- */}
      </Card>
    );
  };
  // --- END MODIFICATION ---

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return { color: COLORS.success };
      case 'in-progress':
        return { color: COLORS.info };
      case 'completed':
        return { color: COLORS.greyDark };
      case 'cancelled':
        return { color: COLORS.danger };
      default:
        return { color: COLORS.greyDark };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.title}>Your Bookings</Text>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.errorText}>You have no bookings.</Text>
          </View>
        }
        onRefresh={fetchUserBookings}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
};

// --- MODIFIED STYLES ---
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
    // Removed flex settings to allow card to wrap content
  },
  bookingDetails: {
    flex: 1,
  },
  bookingService: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: COLORS.greyDark,
    marginLeft: 8,
  },
  bookingProvider: {
    fontSize: 14,
    color: COLORS.greyDark,
    marginLeft: 8,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.greyLight,
    alignSelf: 'flex-start',
    position: 'absolute', // Position status badge
    top: 16,
    right: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // --- NEW STYLES FOR BUTTONS ---
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyLight,
    paddingTop: 16,
  },
  cardButton: {
    flex: 1, // Make buttons take equal space
    marginHorizontal: 4,
    paddingVertical: 10, // Make buttons smaller
  },
  cardButtonText: {
    fontSize: 14,
  },
  cancelButton: {
    borderColor: COLORS.danger,
  },
  cancelButtonText: {
    color: COLORS.danger,
    fontSize: 14,
  },
  // --- END NEW STYLES ---
});

export default BookingStatusScreen;