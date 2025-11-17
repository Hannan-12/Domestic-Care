// src/screens/Booking/ScheduleScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity, // Added TouchableOpacity for recurrence buttons
} from 'react-native';
import { bookingService } from '../../api/bookingService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DatePicker from '../../components/booking/DatePicker';
import { COLORS } from '../../constants/colors';

/**
 * Screen to schedule a booking (FR-6, FR-7, FR-8)
 *
 * @param {object} props
 * @param {object} props.navigation - React Navigation prop
 * @param {object} props.route - React Navigation prop (to get params)
 */
const ScheduleScreen = ({ route, navigation }) => {
  const { provider, serviceId } = route.params;
  const { user } = useAuth(); // Get the logged-in user's ID

  const [bookingDate, setBookingDate] = useState(new Date());
  const [bookingTime, setBookingTime] = useState(new Date());
  const [customNotes, setCustomNotes] = useState('');
  // MODIFIED: Replaced boolean with string for recurrence type
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [isLoading, setIsLoading] = useState(false);
  
  // Array containing all four recurrence options
  const recurrenceOptions = ['none', 'daily', 'weekly', 'monthly'];

  const handleConfirmBooking = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to make a booking.');
      return;
    }

    setIsLoading(true);

    // Combine date and time
    const scheduledTime = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate(),
      bookingTime.getHours(),
      bookingTime.getMinutes()
    );

    const bookingData = {
      userId: user.uid,
      providerId: provider.id,
      serviceId: serviceId,
      scheduleTime: scheduledTime,
      status: 'confirmed', // Or 'pending'
      // MODIFIED: Use recurrenceType string (FR-8 update)
      recurrenceType: recurrenceType, 
    };

    const { bookingId, error } = await bookingService.createBooking(bookingData);

    setIsLoading(false);

    if (error) {
      Alert.alert('Booking Failed', error);
    } else {
      Alert.alert(
        'Booking Confirmed!',
        `Your booking (ID: ${bookingId}) with ${provider.name} has been confirmed. Recurrence: ${recurrenceType}.`
      );
      // Navigate to the 'Bookings' tab to see the new booking
      navigation.navigate('Bookings');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Book {provider.name}</Text>
        <Text style={styles.subtitle}>
          Confirm your appointment details.
        </Text>

        <DatePicker
          date={bookingDate}
          onDateChange={setBookingDate}
          mode="date"
        />

        <DatePicker
          date={bookingTime}
          onDateChange={setBookingTime}
          mode="time"
        />

        <Input
          label="Custom Notes (FR-7)"
          placeholder="e.g., 'Please bring your own vacuum...'"
          value={customNotes}
          onChangeText={setCustomNotes}
          multiline
          style={{ height: 100 }}
        />

        {/* MODIFIED: Recurrence Selector rendering all options */}
        <Text style={styles.switchLabel}>Recurrence (FR-8)</Text>
        <View style={styles.recurrenceContainer}>
          {/* This maps over the array ['none', 'daily', 'weekly', 'monthly'] to create 4 buttons */}
          {recurrenceOptions.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.recurrenceOption,
                // Highlighted style is applied only when the current 'type' matches the selected state
                recurrenceType === type && styles.recurrenceSelected,
              ]}
              onPress={() => setRecurrenceType(type)}
            >
              <Text
                style={[
                  styles.recurrenceText,
                  recurrenceType === type && styles.recurrenceTextSelected,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* END MODIFIED */}

        <Button
          title="Confirm Booking"
          onPress={handleConfirmBooking}
          loading={isLoading}
          style={styles.confirmButton}
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
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText || '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.greyDark || '#555555',
    marginBottom: 24,
  },
  switchLabel: { // Used as a header for recurrence options
    fontSize: 16,
    color: COLORS.darkText,
    fontWeight: '600',
    marginTop: 16, 
    marginBottom: 8,
  },
  // NEW STYLES for recurrence selector
  recurrenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  recurrenceOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  recurrenceSelected: {
    backgroundColor: COLORS.primary,
  },
  recurrenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  recurrenceTextSelected: {
    color: COLORS.white,
  },
  confirmButton: {
    marginTop: 32,
  },
});

export default ScheduleScreen;