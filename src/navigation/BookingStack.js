import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BookingStatusScreen from '../screens/Booking/BookingStatusScreen';
import LiveTrackingScreen from '../screens/Tracking/LiveTrackingScreen';
import RateBookingScreen from '../screens/Booking/RateBookingScreen';
import ChatScreen from '../screens/Chat/ChatScreen'; // Import Chat

const Stack = createNativeStackNavigator();

const BookingStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BookingStatus"
        component={BookingStatusScreen}
        options={{ title: 'My Activity', headerShown: false }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
      <Stack.Screen
        name="LiveTrackingScreen"
        component={LiveTrackingScreen}
        options={{ title: 'Live Tracking' }}
      />
      <Stack.Screen
        name="RateBookingScreen"
        component={RateBookingScreen}
        options={{ title: 'Rate Your Booking' }}
      />
    </Stack.Navigator>
  );
};

export default BookingStack;