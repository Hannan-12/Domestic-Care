// src/screens/Booking/ServiceProvidersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native'; // <-- 1. ADDED ALL MISSING IMPORTS
import { bookingService } from '../../api/bookingService';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const ServiceProvidersScreen = ({ route, navigation }) => {
  // ... (state and useEffect remain the same)
  const { serviceId, serviceName } = route.params;
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: serviceName });
    fetchProviders(serviceId);
  }, [serviceId, serviceName, navigation]);

  const fetchProviders = async (id) => {
    setIsLoading(true);
    setError(null);
    const { providers: fetchedProviders, error: fetchError } =
      await bookingService.getProvidersForService(id);
    
    if (fetchError) {
      setError(fetchError);
      Alert.alert('Error', 'Could not fetch available providers.');
    } else {
      setProviders(fetchedProviders);
    }
    setIsLoading(false);
  };
  
  const handleProviderPress = (provider) => {
    navigation.navigate('ScheduleScreen', { provider, serviceId });
  };

  if (isLoading) {
    // ... (loading view remains the same)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // --- 1. MODIFIED RENDER FUNCTION ---
  const renderProviderCard = ({ item }) => (
    <TouchableOpacity onPress={() => handleProviderPress(item)}>
      <Card style={styles.providerCard}>
        <Image
          style={styles.avatar}
          source={{ uri: item.avatarUrl || 'https://via.placeholder.com/60' }}
        />
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{item.name}</Text>
          <Text style={styles.providerSkill}>
            {item.experience || 'No experience listed'}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={COLORS.secondary} />
            {/* --- 2. USE THE NEW 'ratingText' FIELD --- */}
            <Text style={styles.ratingText}>{item.ratingText || 'New'}</Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={COLORS.grey}
        />
      </Card>
    </TouchableOpacity>
  );
  // --- END MODIFICATION ---

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        // ... (FlatList props remain the same)
        data={providers}
        keyExtractor={(item) => item.id}
        renderItem={renderProviderCard}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.title}>Available Providers</Text>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.errorText}>No providers found for this service.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (all styles remain the same)
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
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkText || '#333333',
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.greyDark,
    fontSize: 16,
    textAlign: 'center',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: COLORS.greyLight,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  providerSkill: {
    fontSize: 14,
    color: COLORS.greyDark,
    marginVertical: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.greyDark,
    marginLeft: 4,
    fontWeight: 'bold',
  },
});

export default ServiceProvidersScreen;