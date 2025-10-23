// src/screens/Booking/SearchServicesScreen.js
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
import { bookingService } from '../../api/bookingService';
import ServiceCard from '../../components/booking/ServiceCard';
import { COLORS } from '../../constants/colors';

/**
 * Screen to search and filter services (FR-5)
 * This is the main screen in the "Home" tab.
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
      await bookingService.getAvailableServices();
    
    if (fetchError) {
      setError(fetchError);
      Alert.alert('Error', 'Could not fetch available services.');
      console.error("Error fetching services: ", fetchError); // Added console log
    } else {
      setServices(fetchedServices);
    }
    setIsLoading(false);
  };

  /**
   * CORRECTED NAVIGATION with CHECKS:
   * When a service card is pressed, navigate to the ServiceProvidersScreen,
   * passing the selected service's ID and Name.
   */
  const handleServicePress = (service) => {
    // --- Add Checks ---
    console.log("Service pressed:", JSON.stringify(service)); // Log the service data

    if (!service || !service.id || !service.Name) {
      console.error("Attempted to navigate without valid service data:", service);
      Alert.alert("Navigation Error", "Could not load service details. Please try again.");
      return; // Stop navigation if data is invalid
    }
    // --- End Checks ---

    // Navigate to the screen listing providers for this service
    navigation.navigate('ServiceProviders', { 
        serviceId: service.id, 
        serviceName: service.Name // Use capital 'N' from Firestore data
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Use the error state to show fetch errors
  if (error && services.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading services: {error.message || error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard service={item} onPress={handleServicePress} />
        )}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.title}>What service do you need?</Text>
        }
         ListEmptyComponent={
            // Show only if not loading and no error fetching
            !isLoading && !error ? (
                 <View style={styles.centered}>
                    <Text style={styles.errorText}>No services available at the moment.</Text>
                 </View>
            ) : null // Don't show "No services" if there was a fetch error
        }
        onRefresh={fetchServices}
        refreshing={isLoading}
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
    marginTop: 50,
  },
  listContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText || '#333333',
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.greyDark,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SearchServicesScreen;

