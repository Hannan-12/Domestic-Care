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
} from 'react-native';
import { bookingService } from '../../api/bookingService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button'; // Ensure this is imported
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const ServiceProvidersScreen = ({ route, navigation }) => {
  const { serviceId, serviceName } = route.params;
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: serviceName });
    fetchProviders(serviceId);
  }, [serviceId]);

  const fetchProviders = async (id) => {
    setIsLoading(true);
    const { providers: fetchedProviders, error } = await bookingService.getProvidersForService(id);
    
    if (error) {
      Alert.alert('Error', 'Could not fetch available providers.');
    } else {
      setProviders(fetchedProviders);
    }
    setIsLoading(false);
  };
  
  // Requirement 2: Main option is to "Make a Request"
  const handleMakeRequest = () => {
    navigation.navigate('CreateRequestScreen', { serviceId, serviceName });
  };

  // Requirement 7: View Reviews
  const handleViewReviews = (provider) => {
    navigation.navigate('ProviderReviewsScreen', { provider });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderProviderCard = ({ item }) => (
    <Card style={styles.providerCard}>
      <Image
        style={styles.avatar}
        source={{ uri: item.avatarUrl || 'https://via.placeholder.com/60' }}
      />
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{item.name}</Text>
        <Text style={styles.providerSkill}>{item.experience || 'Experience not listed'}</Text>
        
        {/* Requirement 7: Clickable Rating */}
        <TouchableOpacity onPress={() => handleViewReviews(item)} style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={COLORS.secondary} />
          <Text style={styles.ratingText}>{item.ratingText || 'New'} (See Reviews)</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.description}>
          Post a request for {serviceName} and let providers bid for your task.
        </Text>
        <Button 
          title="Create Service Request" 
          onPress={handleMakeRequest}
          style={styles.requestBtn}
        />
      </View>

      <Text style={styles.listTitle}>Registered Providers</Text>
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        renderItem={renderProviderCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No specific providers listed yet. Post a request instead!</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderColor: COLORS.greyLight },
  description: { fontSize: 16, color: COLORS.darkText, marginBottom: 12 },
  requestBtn: { backgroundColor: COLORS.primary },
  listTitle: { fontSize: 18, fontWeight: 'bold', margin: 16, marginBottom: 8, color: COLORS.darkText },
  listContainer: { paddingHorizontal: 16 },
  providerCard: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16, backgroundColor: COLORS.greyLight },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText },
  providerSkill: { fontSize: 14, color: COLORS.greyDark, marginVertical: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 14, color: COLORS.primary, marginLeft: 4, fontWeight: 'bold', textDecorationLine: 'underline' },
  emptyText: { textAlign: 'center', marginTop: 20, color: COLORS.greyDark }
});

export default ServiceProvidersScreen;