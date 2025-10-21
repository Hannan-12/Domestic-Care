import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens for the "Profile" tab
import UserProfileScreen from '../screens/Profile/UserProfileScreen';
// We can add EditProfileScreen here later

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} /> */}
    </Stack.Navigator>
  );
};

export default ProfileStack;
