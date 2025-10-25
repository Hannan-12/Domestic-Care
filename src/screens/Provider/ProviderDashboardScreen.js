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
// MODIFIED IMPORT
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../api/bookingService'; // <-- IMPORT SERVICE
import { COLORS } from '../../constants/colors';
import Card from '../../components/common/Card';
import { useIsFocused } from '@react-navigation/native'; // <-- IMPORT useIsFocused

/**
 * This is the "Home" screen for Providers.
 * It now lists all bookings assigned to them.
 */
const ProviderDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isFocused = useIsFocused(); // Hook to refetch when tab is visited
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Re-fetch when the screen comes into focus
    if (user && isFocused) {
      fetchProviderBookings();
    }
  }, [user, isFocused]); // <-- ADD isFocused dependency

  const fetchProviderBookings = async () => {
    setIsLoading(true);
    setError(null);
    // Call the new function we created
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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // --- MODIFY THIS FUNCTION ---
  const renderBookingCard = ({ item }) => (
    <Card style={styles.bookingCard}>
      <Text style={styles.bookingTitle}>Booking Details</Text>

      {/* CHANGED LINE: Show clientName */}
      <Text style={styles.bookingInfo}>
        Client: {item.clientName}
      </Text>

      {/* CHANGED LINE: Show serviceName */}
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
    </Card>
  );
  // --- END MODIFICATION ---

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
    marginBottom: 8, // Added margin
  },
  bookingInfo: {
    fontSize: 16, // Made text larger
    color: COLORS.darkText,
    marginVertical: 4, // Added vertical margin
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
});

export default ProviderDashboardScreen;