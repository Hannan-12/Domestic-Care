// src/screens/Profile/ProviderSkillsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../api/profileService';
import { bookingService } from '../../api/bookingService';
import SkillTag from '../../components/profile/SkillTag';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

/**
 * Screen for providers to manage their skills (FR-3)
 */
const ProviderSkillsScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  // All possible services offered by the app
  const [allServices, setAllServices] = useState([]);
  // The service IDs the provider has selected
  const [selectedSkillIds, setSelectedSkillIds] = useState(
    profile?.skills || []
  );

  // Fetch all available services from Firestore
  useEffect(() => {
    const fetchServices = async () => {
      const { services, error } =
        await bookingService.getAvailableServices();
      if (error) {
        Alert.alert('Error', 'Could not load available services.');
      } else {
        setAllServices(services);
      }
      setIsLoadingServices(false);
    };
    fetchServices();
  }, []);

  const toggleSkill = (serviceId) => {
    if (selectedSkillIds.includes(serviceId)) {
      // Remove it
      setSelectedSkillIds((prev) => prev.filter((id) => id !== serviceId));
    } else {
      // Add it
      setSelectedSkillIds((prev) => [...prev, serviceId]);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
      Alert.alert('Error', 'You are not logged in.');
      return;
    }

    setIsSaving(true);
    const detailsToUpdate = {
      skills: selectedSkillIds,
    };

    const { success, error } = await profileService.updateProviderDetails(
      user.uid,
      detailsToUpdate
    );

    setIsSaving(false);

    if (error) {
      Alert.alert('Save Failed', error);
    } else {
      Alert.alert('Success', 'Your skills have been updated.');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Manage Your Skills</Text>
        <Text style={styles.subtitle}>
          Select all the services you offer. This is what clients will see.
        </Text>

        {isLoadingServices ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <View style={styles.tagContainer}>
            {allServices.length > 0 ? (
              allServices.map((service) => (
                <SkillTag
                  key={service.id}
                  skillName={service.Name} // Use 'Name' from Firestore
                  isSelected={selectedSkillIds.includes(service.id)}
                  onPress={() => toggleSkill(service.id)}
                />
              ))
            ) : (
              <Text style={styles.errorText}>No services found.</Text>
            )}
          </View>
        )}

        <Button
          title="Save Skills"
          onPress={handleSaveChanges}
          loading={isSaving}
          style={styles.saveButton}
          disabled={isLoadingServices}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F5DC',
  },
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.greyDark,
    marginBottom: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  saveButton: {
    marginTop: 32,
  },
  errorText: {
    color: COLORS.greyDark,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProviderSkillsScreen;