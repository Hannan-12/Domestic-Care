import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// Import the new stack navigators for each tab
import HomeStack from './HomeStack';
import BookingStack from './BookingStack';
import ProfileStack from './ProfileStack';
import SupportStack from './SupportStack';

const Tab = createBottomTabNavigator();

/**
 * The main Bottom Tab Navigator for the app.
 * Each tab is now its own StackNavigator.
 */
const MainTabStack = () => {
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
        component={HomeStack} 
      />
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
