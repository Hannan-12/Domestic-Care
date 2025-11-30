// src/navigation/ProviderHomeStack.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// Import screens
import JobBoardScreen from '../screens/Provider/JobBoardScreen';
import ProviderDashboardScreen from '../screens/Provider/ProviderDashboardScreen';
import ProviderVerificationScreen from '../screens/Profile/ProviderVerificationScreen';
import ChatScreen from '../screens/Chat/ChatScreen'; // <--- 1. IMPORT CHAT

const Stack = createNativeStackNavigator();

const ProviderHomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="JobBoard"
        component={JobBoardScreen}
        options={({ navigation }) => ({ 
          title: 'Job Board (Bidding)',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('ProviderDashboard')}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ color: COLORS.primary, fontWeight: 'bold', marginRight: 5 }}>My Jobs</Text>
              <Ionicons name="briefcase-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )
        })}
      />

      <Stack.Screen
        name="ProviderDashboard"
        component={ProviderDashboardScreen}
        options={{ title: 'My Assigned Jobs' }}
      />
      
      <Stack.Screen
        name="ProviderVerificationScreen"
        component={ProviderVerificationScreen}
        options={{ title: 'Verify Identity' }}
      />

      {/* 2. ADD CHAT SCREEN HERE */}
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
};

export default ProviderHomeStack;