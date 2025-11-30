import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SearchServicesScreen from '../screens/Booking/SearchServicesScreen';
import ServiceProvidersScreen from '../screens/Booking/ServiceProvidersScreen';
import CreateRequestScreen from '../screens/Booking/CreateRequestScreen';
import ProviderReviewsScreen from '../screens/Booking/ProviderReviewsScreen';
// ScheduleScreen removed or kept as legacy, replacing flow with CreateRequest

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SearchServices"
        component={SearchServicesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ServiceProviders"
        component={ServiceProvidersScreen}
        options={{ title: 'Service Details' }}
      />
      <Stack.Screen
        name="CreateRequestScreen"
        component={CreateRequestScreen}
        options={{ title: 'Make a Request' }}
      />
      <Stack.Screen
        name="ProviderReviewsScreen"
        component={ProviderReviewsScreen}
        options={{ title: 'Provider Reviews' }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;