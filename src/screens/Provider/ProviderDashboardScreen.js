// src/screens/Provider/ProviderDashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, StatusBar, TouchableOpacity
} from 'react-native';
import { bookingService } from '../../api/bookingService';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

// --- Badge Component ---
const StatusBadge = ({ status }) => {
  let bg = '#E0F7FA', text = '#006064';
  if (status === 'completed') { bg = '#E8F5E9'; text = '#2E7D32'; }
  if (status === 'confirmed') { bg = '#FFF3E0'; text = '#E65100'; }
  
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{status.toUpperCase()}</Text>
    </View>
  );
};

const ProviderDashboardScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const isFocused = useIsFocused();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Check Verification ---
  if (profile?.role === 'provider' && profile?.verificationStatus !== 'approved') {
    return (
       <View style={styles.centerContainer}>
         <Ionicons name="lock-closed-outline" size={60} color={COLORS.grey} />
         <Text style={styles.emptyText}>Account not verified.</Text>
         <TouchableOpacity onPress={() => navigation.navigate('ProviderVerificationScreen')}>
            <Text style={{color: COLORS.primary, fontWeight: 'bold', marginTop: 10}}>Go to Verification</Text>
         </TouchableOpacity>
       </View>
    );
  }

  useEffect(() => {
    if (user && isFocused) {
      fetchProviderBookings();
    }
  }, [user, isFocused]);

  const fetchProviderBookings = async () => {
    setIsLoading(true);
    const { bookings, error } = await bookingService.getProviderBookings(user.uid);
    if (!error) setBookings(bookings);
    setIsLoading(false);
  };

  const handleCompleteBooking = (bookingId) => {
    Alert.alert('Complete Job', 'Are you sure you have finished this job?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Complete', onPress: async () => {
            await bookingService.updateBookingStatus(bookingId, 'completed');
            fetchProviderBookings();
        }}
    ]);
  };

  // --- Render Item ---
  const renderBookingCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
            <Text style={styles.cardTitle}>{item.serviceName}</Text>
            <Text style={styles.clientText}>Client: {item.clientName || 'Client'}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
         <Ionicons name="calendar-outline" size={16} color={COLORS.greyDark} />
         <Text style={styles.infoText}>
            {item.scheduleTime ? new Date(item.scheduleTime).toLocaleString() : 'N/A'}
         </Text>
      </View>
      <View style={styles.infoRow}>
         <Ionicons name="wallet-outline" size={16} color={COLORS.greyDark} />
         <Text style={styles.infoText}>Earnings: {item.totalPrice} Rs</Text>
      </View>

      {/* --- Action Buttons --- */}
      <View style={styles.actionRow}>
          {item.status === 'confirmed' && (
              <TouchableOpacity 
                style={styles.completeBtn} 
                onPress={() => handleCompleteBooking(item.id)}
              >
                <Ionicons name="checkmark-done-circle" size={20} color="#FFF" style={{marginRight: 6}} />
                <Text style={styles.btnText}>Mark Completed</Text>
              </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.chatBtn}
            onPress={() => navigation.navigate('ChatScreen', { 
                requestId: item.id, 
                chatTitle: item.clientName || 'Client',
                providerId: user.uid 
            })}
          >
             <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* --- Header --- */}
      <View style={styles.headerBackground}>
        <Text style={styles.headerTitle}>My Assignments</Text>
      </View>

      {/* --- Stats Banner --- */}
      <View style={styles.statsContainer}>
         <View style={styles.statItem}>
            <Text style={styles.statNumber}>{bookings.filter(b => b.status === 'confirmed').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
         </View>
         <View style={styles.verticalDivider} />
         <View style={styles.statItem}>
            <Text style={styles.statNumber}>{bookings.filter(b => b.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
         </View>
         <View style={styles.verticalDivider} />
         <View style={styles.statItem}>
            <Text style={styles.statNumber}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
         </View>
      </View>

      {isLoading ? (
          <View style={styles.centerContainer}>
             <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
      ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={renderBookingCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={styles.centerContainer}>
                    <Ionicons name="folder-open-outline" size={60} color={COLORS.grey} />
                    <Text style={styles.emptyText}>No assigned jobs yet.</Text>
                </View>
            }
          />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // --- Header ---
  headerBackground: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },

  // --- Stats ---
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 10,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText },
  statLabel: { fontSize: 12, color: COLORS.greyDark },
  verticalDivider: { width: 1, backgroundColor: '#EEE' },

  // --- List & Card ---
  listContent: { padding: 20 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText },
  clientText: { fontSize: 13, color: COLORS.greyDark, marginTop: 2 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { marginLeft: 8, fontSize: 14, color: COLORS.greyDark },

  // --- Actions ---
  actionRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  completeBtn: {
    flex: 1,
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 25,
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  chatBtn: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { color: COLORS.greyDark, marginTop: 10, fontSize: 16 },
});

export default ProviderDashboardScreen;