// src/navigation/MainTabStack.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';

// Import the stack navigators for each tab
import HomeStack from './HomeStack';
import BookingStack from './BookingStack';
import ProfileStack from './ProfileStack';
import SupportStack from './SupportStack';
import ProviderHomeStack from './ProviderHomeStack';

const Tab = createBottomTabNavigator();

/**
 * The main Bottom Tab Navigator for the app.
 * It now conditionally renders tabs based on user role.
 */
const MainTabStack = () => {
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

          // Set icon based on route name
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Dashboard') {
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
      {/* --- MODIFIED CONDITIONAL TABS --- */}
      {isProvider ? (
        // --- TABS FOR PROVIDERS ---
        <>
          <Tab.Screen
            name="Dashboard"
            component={ProviderHomeStack}
          />
          {/* "Bookings" tab is now hidden for providers */}
        </>
      ) : (
        // --- TABS FOR CLIENTS ---
        <>
          <Tab.Screen
            name="Home"
            component={HomeStack}
          />
          <Tab.Screen
            name="Bookings"
            component={BookingStack}
          />
        </>
      )}
      {/* --- END OF CONDITIONAL TABS --- */}

      {/* --- SHARED TABS (for both roles) --- */}
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