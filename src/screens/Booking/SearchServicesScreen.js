// src/screens/Booking/SearchServicesScreen.js
// NOTE: The original uploaded file had the content of ServiceProvidersScreen.js
// This is the assumed correct content for SearchServicesScreen.js based on its function.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { bookingService } from '../../api/bookingService'; // Corrected path assuming api is in src/api
import ServiceCard from '../../components/booking/ServiceCard'; // Corrected path assuming components is in src/components
import { COLORS } from '../../constants/colors'; // Corrected path assuming constants is in src/constants

/**
 * Screen to display available services and allow searching/filtering.
 * This is likely the first screen in the "Home" tab's stack. (FR-5)
 *
 * @param {object} props
 * @param {object} props.navigation - React Navigation prop
 */
const SearchServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    const { services: fetchedServices, error: fetchError } =
      await bookingService.getAvailableServices(); // Fetch the list of services

    if (fetchError) {
      setError(fetchError);
      Alert.alert('Error', 'Could not fetch available services.');
    } else {
      setServices(fetchedServices);
    }
    setIsLoading(false);
  };

  /**
   * Handles navigation when a service card is pressed.
   * Sends the serviceId and serviceName to the next screen.
   */
  const handleServicePress = (service) => {
    // --- THIS IS THE CRITICAL FIX ---
    // Ensure the service object and its properties exist before navigating
    if (service && service.id && service.name) {
      navigation.navigate('ServiceProviders', {
        serviceId: service.id, // Pass the ID
        serviceName: service.name, // Pass the Name
      });
    } else {
      console.error('Attempted to navigate without valid service data:', service);
      Alert.alert('Error', 'Could not select service. Data is missing.');
    }
    // --- END OF FIX ---
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        {/* You might want a retry button here */}
      </View>
    );
  }

  const renderServiceItem = ({ item }) => (
    <ServiceCard service={item} onPress={handleServicePress} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.title}>Select a Service</Text>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.errorText}>No services available at the moment.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F5DC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50, // Added margin for better centering if list is empty initially
  },
  listContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24, // Slightly larger title
    fontWeight: 'bold',
    color: COLORS.darkText || '#333333',
    marginBottom: 16,
    // textAlign: 'center', // Center the title if preferred
  },
  errorText: {
    color: COLORS.greyDark,
    fontSize: 16,
    textAlign: 'center',
  },
  // Removed ServiceCard specific styles as they are now in ServiceCard.js
});

export default SearchServicesScreen;