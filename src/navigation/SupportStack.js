import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens for the "Support" tab
import HelpCenterScreen from '../screens/Support/HelpCenterScreen';

const Stack = createNativeStackNavigator();

const SupportStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default SupportStack;
