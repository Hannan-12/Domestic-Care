// src/navigation/MainTabStack.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { View, ActivityIndicator } from 'react-native'; // Import loading components
import { useAuth } from '../hooks/useAuth'; // <-- 1. IMPORT useAuth

// Import the stack navigators for each tab
import HomeStack from './HomeStack';
import BookingStack from './BookingStack';
import ProfileStack from './ProfileStack';
import SupportStack from './SupportStack';
import ProviderHomeStack from './ProviderHomeStack'; // <-- 2. IMPORT ProviderHomeStack

const Tab = createBottomTabNavigator();

/**
 * The main Bottom Tab Navigator for the app.
 * It now conditionally renders the 'Home' tab based on user role.
 */
const MainTabStack = () => {
  // <-- 3. GET USER PROFILE AND LOADING STATE
  const { profile, isLoading } = useAuth();

  // Show a loading spinner while we wait for the profile to load
  if (isLoading || !profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Check the user's role
  const isProvider = profile.role === 'provider';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Hide the header here because each stack has its own
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.greyDark,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.greyLight,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // <-- 4. ADJUST ICON NAME FOR ROLE
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Dashboard') {
            // New icon for Provider 'Dashboard'
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Support') {
            iconName = focused
              ? 'chatbubble-ellipses'
              : 'chatbubble-ellipses-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/*
       * <-- 5. CONDITIONAL NAVIGATION
       * Show 'Home' for clients, 'Dashboard' for providers.
       */}
      {isProvider ? (
        <Tab.Screen
          name="Dashboard"
          component={ProviderHomeStack}
        />
      ) : (
        <Tab.Screen
          name="Home"
          component={HomeStack}
        />
      )}
      {/* END OF CONDITIONAL NAVIGATION */}

      <Tab.Screen
        name="Bookings"
        component={BookingStack}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
      />
      <Tab.Screen
        name="Support"
        component={SupportStack}
      />
    </Tab.Navigator>
  );
};

export default MainTabStack;