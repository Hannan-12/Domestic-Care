import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../api/bookingService';
import { COLORS } from '../../constants/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useIsFocused } from '@react-navigation/native';

const ProviderDashboardScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const isFocused = useIsFocused();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ADMIN APPROVAL CHECK ---
  if (profile?.role === 'provider' && profile?.verificationStatus !== 'approved') {
    return (
       <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
         <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Account Pending</Text>
         <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16, color: COLORS.greyDark }}>
           {profile?.verificationStatus === 'pending' 
             ? "Your documents are currently under review by the Admin. You cannot accept jobs yet." 
             : "You have not submitted your verification documents yet."}
         </Text>
         <Button 
           title="Go to Verification Page" 
           onPress={() => navigation.navigate('ProviderVerificationScreen')} 
         />
       </SafeAreaView>
    );
  }
  // ----------------------------

  useEffect(() => {
    if (user && isFocused) {
      fetchProviderBookings();
    }
  }, [user, isFocused]);

  const fetchProviderBookings = async () => {
    setIsLoading(true);
    // Fetch bookings that have been accepted/confirmed
    const { bookings, error } = await bookingService.getProviderBookings(user.uid);
    if (!error) setBookings(bookings);
    setIsLoading(false);
  };

  const handleCompleteBooking = (bookingId) => {
    Alert.alert('Complete Job', 'Confirm completion?', [
        { text: 'Cancel' },
        { text: 'Complete', onPress: async () => {
            await bookingService.updateBookingStatus(bookingId, 'completed');
            fetchProviderBookings();
        }}
    ]);
  };

  const renderBookingCard = ({ item }) => (
    <Card style={styles.bookingCard}>
      <Text style={styles.bookingTitle}>{item.serviceName}</Text>
      <Text>Client: {item.clientName || 'Client'}</Text>
      <Text>Status: {item.status.toUpperCase()}</Text>
      <Text>Date: {item.scheduleTime.toLocaleString()}</Text>
      
      {item.status === 'confirmed' && (
          <Button 
            title="Mark Completed" 
            onPress={() => handleCompleteBooking(item.id)} 
            style={{marginTop: 10, backgroundColor: COLORS.success}}
          />
      )}
    </Card>
  );

  if (isLoading) return <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={<Text style={styles.title}>Assigned Jobs</Text>}
        ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20}}>No active jobs. Go to the Job Board to bid!</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: COLORS.darkText },
  bookingCard: { padding: 16, marginBottom: 12 },
  bookingTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
});

export default ProviderDashboardScreen;