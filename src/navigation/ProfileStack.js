// src/navigation/ProfileStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import UserProfileScreen from '../screens/Profile/UserProfileScreen';
import ProviderAvailabilityScreen from '../screens/Profile/ProviderAvailabilityScreen';
import ProviderSkillsScreen from '../screens/Profile/ProviderSkillsScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen'; // <-- 1. IMPORT
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.darkText,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ headerShown: false }}
      />
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
      
      {/* --- 2. ADD SCREEN TO STACK --- */}
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      
    </Stack.Navigator>
  );
};

export default ProfileStack;