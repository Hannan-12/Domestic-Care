import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import the screens for the "Home" tab flow
import SearchServicesScreen from '../screens/Booking/SearchServicesScreen';
import ServiceProvidersScreen from '../screens/Booking/ServiceProvidersScreen';
import ScheduleScreen from '../screens/Booking/ScheduleScreen';

const Stack = createNativeStackNavigator();

// This navigator handles the entire booking flow
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SearchServices"
        component={SearchServicesScreen}
        options={{ headerShown: false }} // The tab navigator already has a header
      />
      <Stack.Screen
        name="ServiceProviders"
        component={ServiceProvidersScreen}
        options={{ title: 'Available Providers' }} // Header title for this screen
      />
      <Stack.Screen
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{ title: 'Schedule Booking' }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
