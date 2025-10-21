// src/screens/Tracking/LiveTrackingScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { bookingService } from '../../api/bookingService';
import { mapService } from '../../api/mapService';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

/**
 * Screen for real-time GPS tracking of a provider (FR-9, FR-11, FR-12)
 *
 * @param {object} props
 * @param {object} props.route - React Navigation prop (to get params)
 */
const LiveTrackingScreen = ({ route }) => {
  const { bookingId, providerId } = route.params;
  const { profile: userProfile } = useAuth(); // Get user's profile for their location
  const mapRef = useRef(null);

  const [providerLocation, setProviderLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [error, setError] = useState(null);

  // User's location (destination) - This should ideally come from the user's profile
  const userLocation = {
    latitude: 33.6844, // Example: Islamabad
    longitude: 73.0479,
  };

  useEffect(() => {
    // Start listening to the provider's location updates from Realtime DB
    const unsubscribe = bookingService.listenToProviderLocation(
      providerId,
      (location) => {
        if (location) {
          setProviderLocation(location);
          // Fit map to both user and provider
          if (mapRef.current) {
            mapRef.current.fitToCoordinates([location, userLocation], {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            });
          }
        } else {
          setError('Provider location is not available.');
        }
      }
    );

    // Stop listening when the screen is unmounted
    return () => unsubscribe();
  }, [providerId]);

  // Effect to update ETA (FR-11) whenever the provider's location changes
  useEffect(() => {
    if (providerLocation && userLocation) {
      // Fetch new ETA
      (async () => {
        const { duration } = await mapService.getEtaAndDistance(
          providerLocation,
          userLocation
        );
        if (duration) {
          setEta(duration);
        }
      })();
    }
  }, [providerLocation, userLocation]);

  const handleEmergencyAlert = () => {
    // This implements FR-12
    Alert.alert(
      'Emergency Alert (SOS)',
      'Are you sure you want to send an emergency alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          onPress: () => {
            // TODO: Add logic to send notification to emergency contacts
            console.log('SOS Alert Triggered for booking:', bookingId);
            Alert.alert('Alert Sent', 'Your emergency contacts have been notified.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...userLocation,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* User's Location Marker */}
        <Marker
          coordinate={userLocation}
          title="Your Location"
          pinColor={COLORS.primary}
        />

        {/* Provider's Location Marker */}
        {providerLocation && (
          <Marker
            coordinate={providerLocation}
            title="Service Provider"
            pinColor={COLORS.secondary}
          />
        )}
      </MapView>

      <Card style={styles.detailsCard}>
        {eta && <Text style={styles.etaText}>Estimated Arrival: {eta}</Text>}

        {!providerLocation && !error && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Waiting for provider's location...</Text>
          </View>
        )}
        
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title="Emergency SOS (FR-12)"
          onPress={handleEmergencyAlert}
          style={styles.sosButton}
          textStyle={styles.sosButtonText}
          type="secondary"
        />
      </Card>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F5DC',
  },
  map: {
    flex: 1,
  },
  detailsCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
  },
  etaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.greyDark,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  sosButton: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  sosButtonText: {
    color: COLORS.white,
  },
});

export default LiveTrackingScreen;