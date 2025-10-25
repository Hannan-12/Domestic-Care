// src/navigation/SupportStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';

// Import screens for the "Support" tab
import HelpCenterScreen from '../screens/Support/HelpCenterScreen';
import FaqsScreen from '../screens/Support/FaqsScreen'; // <-- 1. IMPORT THE NEW SCREEN

const Stack = createNativeStackNavigator();

const SupportStack = () => {
  return (
    <Stack.Navigator
      // --- 2. ADD STYLING ---
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.darkText,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false, // Removes shadow
      }}
    >
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{ headerShown: false }}
      />
      
      {/* --- 3. ADD THIS SCREEN TO THE STACK --- */}
      <Stack.Screen
        name="FaqsScreen"
        component={FaqsScreen}
        options={{ title: 'FAQs & Help Guides' }}
      />
      {/* ------------------------------------- */}

    </Stack.Navigator>
  );
};

export default SupportStack;