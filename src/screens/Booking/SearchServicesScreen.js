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
  TextInput,
  Image,
  StatusBar
} from 'react-native';
import { bookingService } from '../../api/bookingService';
import ServiceCard from '../../components/booking/ServiceCard';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth'; // To get user name
import { Ionicons } from '@expo/vector-icons';

const SearchServicesScreen = ({ navigation }) => {
  const { profile } = useAuth(); // Get profile for greeting
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
    } else {
      setServices(fetchedServices);
    }
    setIsLoading(false);
  };

  const handleServicePress = (service) => {
    if (!service || !service.id || !service.Name) {
      Alert.alert("Navigation Error", "Invalid service data.");
      return;
    }
    navigation.navigate('ServiceProviders', { 
        serviceId: service.id, 
        serviceName: service.Name 
    });
  };

  // Filter services based on search query
  const filteredServices = services.filter(service => 
    service.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- NEW: Header Component to fill space and look attractive ---
  const renderHeader = () => (
    <View>
      {/* Top Header Section (Teal Background) */}
      <View style={styles.headerContainer}>
        <View style={styles.userInfo}>
          <View>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.userName}>{profile?.name || 'Guest'}</Text>
          </View>
          <Image 
            source={{ uri: profile?.avatarUrl || 'https://via.placeholder.com/100' }} 
            style={styles.headerAvatar} 
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.greyDark} style={{cX: 8}} />
          <TextInput
            placeholder="Find a service..."
            placeholderTextColor={COLORS.greyDark}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Promotional Banner (Mustard/Secondary) */}
      <View style={styles.promoContainer}>
        <View style={styles.promoContent}>
          <Text style={styles.promoTitle}>Special Offer!</Text>
          <Text style={styles.promoText}>Get 20% off your first home cleaning.</Text>
        </View>
        <Ionicons name="sparkles" size={40} color={COLORS.primary} />
      </View>

      <Text style={styles.sectionTitle}>Our Services</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard service={item} onPress={handleServicePress} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
            !isLoading && !error ? (
                 <View style={styles.centered}>
                    <Text style={styles.emptyText}>No services found matching "{searchQuery}".</Text>
                 </View>
            ) : null
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
    backgroundColor: COLORS.background, // Beige
  },
  listContainer: {
    paddingBottom: 24,
  },
  // --- Header Styles ---
  headerContainer: {
    backgroundColor: COLORS.primary, // Deep Teal
    padding: 24,
    paddingTop: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  userName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.darkText,
  },
  // --- Promo Styles ---
  promoContainer: {
    backgroundColor: COLORS.secondary, // Mustard
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  promoText: {
    fontSize: 14,
    color: '#333',
  },
  // --- Section Styles ---
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginLeft: 16,
    marginBottom: 12,
  },
  // --- Misc ---
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    color: COLORS.greyDark,
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default SearchServicesScreen;