// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';

// We will create these files in the next steps
import AuthStack from './AuthStack';
import MainTabStack from './MainTabStack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

/**
 * The main App Navigator.
 * It conditionally renders the Auth stack or the Main app stack
 * based on the user's authentication state.
 */
const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    // Show a loading screen while checking auth state
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // User is logged in, show the main app
          <Stack.Screen name="MainApp" component={MainTabStack} />
        ) : (
          // User is not logged in, show the auth flow
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background || '#F5F5DC',
  },
});

export default AppNavigator;