import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import the screens for the "Bookings" tab flow
import BookingStatusScreen from '../screens/Tracking/BookingStatusScreen';
import LiveTrackingScreen from '../screens/Tracking/LiveTrackingScreen';

const Stack = createNativeStackNavigator();

// This navigator handles viewing bookings and live tracking
const BookingStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BookingStatus"
        component={BookingStatusScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LiveTrackingScreen"
        component={LiveTrackingScreen}
        options={{ title: 'Live Tracking' }}
      />
    </Stack.Navigator>
  );
};

export default BookingStack;
