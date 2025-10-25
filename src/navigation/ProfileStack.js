// src/navigation/ProfileStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens for the "Profile" tab
import UserProfileScreen from '../screens/Profile/UserProfileScreen';
// We can add EditProfileScreen here later

// <-- 1. IMPORT NEW PROVIDER SCREENS
import ProviderAvailabilityScreen from '../screens/Profile/ProviderAvailabilityScreen';
import ProviderSkillsScreen from '../screens/Profile/ProviderSkillsScreen';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      // <-- 2. ADD STYLING OPTIONS FOR A CLEANER LOOK
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.darkText,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false, // Removes shadow
      }}
    >
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ headerShown: false }}
      />
      {/* <-- 3. ADD THE NEW SCREENS TO THE STACK --> */}
      <Stack.Screen
        name="ProviderAvailability"
        component={ProviderAvailabilityScreen}
        options={{ title: 'Manage Availability' }}
      />
      <Stack.Screen
        name="ProviderSkills"
        component={ProviderSkillsScreen}
        options={{ title: 'Manage Skills' }}
      />
      {/* <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} /> */}
    </Stack.Navigator>
  );
};

export default ProfileStack;