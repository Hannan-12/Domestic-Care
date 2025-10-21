// src/screens/Tracking/BookingStatusScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../api/bookingService';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { useIsFocused } from '@react-navigation/native';

/**
 * Screen to show a user's past and upcoming bookings (Module 3)
 * This is the main "Bookings" tab.
 *
 * @param {object} props
 * @param {object} props.navigation - React Navigation prop
 */
const BookingStatusScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isFocused = useIsFocused(); // Hook to refetch when tab is visited
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
      // Sort bookings by date, newest first
      const sortedBookings = fetchedBookings.sort((a, b) => 
        b.scheduleTime.toDate() - a.scheduleTime.toDate()
      );
      setBookings(sortedBookings);
    }
    setIsLoading(false);
  };

  const handleBookingPress = (booking) => {
    // If the booking is active, navigate to live tracking (FR-9)
    if (booking.status === 'in-progress' || booking.status === 'confirmed') {
      navigation.navigate('LiveTrackingScreen', { bookingId: booking.id, providerId: booking.providerId });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderBookingCard = ({ item }) => (
    <TouchableOpacity onPress={() => handleBookingPress(item)}>
      <Card style={styles.bookingCard}>
        <View>
          <Text style={styles.bookingService}>Service ID: {item.serviceId}</Text>
          <Text style={styles.bookingDate}>
            {item.scheduleTime.toDate().toLocaleString()}
          </Text>
          <Text style={styles.bookingProvider}>
            Provider ID: {item.providerId}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, getStatusColor(item.status)]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  bookingService: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  bookingDate: {
    fontSize: 14,
    color: COLORS.greyDark,
    marginVertical: 4,
  },
  bookingProvider: {
    fontSize: 14,
    color: COLORS.greyDark,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.greyLight,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BookingStatusScreen;