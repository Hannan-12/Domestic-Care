// src/navigation/ProviderHomeStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import the new screen for the provider
import ProviderDashboardScreen from '../screens/Provider/ProviderDashboardScreen';

const Stack = createNativeStackNavigator();

// This navigator handles the "Dashboard" tab for providers
const ProviderHomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProviderDashboard"
        component={ProviderDashboardScreen}
        options={{ headerShown: false }}
      />
      {/* You could add screens for viewing booking details here */}
    </Stack.Navigator>
  );
};

export default ProviderHomeStack;