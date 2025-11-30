import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import UserProfileScreen from '../screens/Profile/UserProfileScreen';
import ProviderAvailabilityScreen from '../screens/Profile/ProviderAvailabilityScreen';
import ProviderSkillsScreen from '../screens/Profile/ProviderSkillsScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ProviderVerificationScreen from '../screens/Profile/ProviderVerificationScreen';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.white },
        headerTintColor: COLORS.darkText,
        headerTitleStyle: { fontWeight: 'bold' },
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
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="ProviderVerificationScreen"
        component={ProviderVerificationScreen}
        options={{ title: 'Verify Identity' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;