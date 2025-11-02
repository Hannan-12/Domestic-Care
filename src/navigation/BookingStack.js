// src/navigation/BookingStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- 1. IMPORT THE NEW SCREEN ---
// Import the correct file from the 'Booking' folder
import BookingStatusScreen from '../screens/Booking/BookingStatusScreen';
import LiveTrackingScreen from '../screens/Tracking/LiveTrackingScreen';
import RateBookingScreen from '../screens/Booking/RateBookingScreen';

const Stack = createNativeStackNavigator();

// This navigator handles viewing bookings and live tracking
const BookingStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BookingStatus"
        component={BookingStatusScreen} // This will now use the correct component
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LiveTrackingScreen"
        component={LiveTrackingScreen}
        options={{ title: 'Live Tracking' }}
      />
      {/* --- 2. ADD THE NEW SCREEN TO THE STACK --- */}
      <Stack.Screen
        name="RateBookingScreen"
        component={RateBookingScreen}
        options={{ title: 'Rate Your Booking' }}
      />
    </Stack.Navigator>
  );
};

export default BookingStack;