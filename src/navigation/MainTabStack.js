// src/navigation/MainTabStack.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// Import the main screen for each tab
// We will create these screens in the /screens directory later
import SearchServicesScreen from '../screens/Booking/SearchServicesScreen';
import BookingStatusScreen from '../screens/Tracking/BookingStatusScreen';
import UserProfileScreen from '../screens/Profile/UserProfileScreen';
import HelpCenterScreen from '../screens/Support/HelpCenterScreen';

const Tab = createBottomTabNavigator();

/**
 * The main Bottom Tab Navigator for the app.
 * This is shown after the user logs in.
 */
const MainTabStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true, // We can customize headers per-screen later
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.greyDark,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.greyLight,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
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
      <Tab.Screen
        name="Home"
        component={SearchServicesScreen} // Module 2
        options={{ title: 'Book a Service' }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingStatusScreen} // Module 3
        options={{ title: 'My Bookings' }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfileScreen} // Module 1
        options={{ title: 'My Profile' }}
      />
      <Tab.Screen
        name="Support"
        component={HelpCenterScreen} // Module 5
        options={{ title: 'Help Center' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabStack;