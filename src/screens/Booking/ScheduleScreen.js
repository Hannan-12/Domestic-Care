// src/screens/Booking/ScheduleScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
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
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      customNotes: customNotes, // FR-7
      isRecurring: isRecurring, // FR-8
    };

    const { bookingId, error } = await bookingService.createBooking(bookingData);

    setIsLoading(false);

    if (error) {
      Alert.alert('Booking Failed', error);
    } else {
      Alert.alert(
        'Booking Confirmed!',
        `Your booking (ID: ${bookingId}) with ${provider.name} has been confirmed.`
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

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Recurring Booking? (FR-8)</Text>
          <Switch
            trackColor={{ false: COLORS.grey, true: COLORS.primaryLight }}
            thumbColor={isRecurring ? COLORS.primary : COLORS.greyLight}
            onValueChange={setIsRecurring}
            value={isRecurring}
          />
        </View>

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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.darkText,
    fontWeight: '600',
  },
  confirmButton: {
    marginTop: 32,
  },
});

export default ScheduleScreen;