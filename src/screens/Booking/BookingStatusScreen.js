// src/screens/Booking/BookingStatusScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../api/bookingService';
import { COLORS } from '../../constants/colors';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// --- Components ---

const StatusBadge = ({ status }) => {
  let backgroundColor = '#E0F7FA';
  let textColor = '#006064';
  let icon = 'ellipse';

  switch (status) {
    case 'open':
      backgroundColor = '#FFF3E0'; // Light Orange
      textColor = '#E65100';
      icon = 'time-outline';
      break;
    case 'confirmed':
      backgroundColor = '#E8F5E9'; // Light Green
      textColor = '#2E7D32';
      icon = 'checkmark-circle-outline';
      break;
    case 'completed':
      backgroundColor = '#E3F2FD'; // Light Blue
      textColor = '#1565C0';
      icon = 'ribbon-outline';
      break;
    case 'canceled':
    case 'cancelled':
      backgroundColor = '#FFEBEE'; // Light Red
      textColor = '#C62828';
      icon = 'close-circle-outline';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Ionicons name={icon} size={12} color={textColor} style={{ marginRight: 4 }} />
      <Text style={[styles.badgeText, { color: textColor }]}>{status.toUpperCase()}</Text>
    </View>
  );
};

const BookingStatusScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  
  const [activeTab, setActiveTab] = useState('requests'); 
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && isFocused) {
      fetchData();
    }
  }, [user, isFocused, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    let result;
    if (activeTab === 'requests') {
        result = await bookingService.getClientRequests(user.uid);
        setData(result.requests);
    } else {
        result = await bookingService.getUserBookings(user.uid);
        
        // Filter logic
        const activeBookings = result.bookings.filter(b => {
            if (b.status === 'canceled' || b.status === 'cancelled') return false;
            if (b.status === 'completed' && (b.ratingSubmitted || b.ratingSkipped)) return false;
            return true;
        });
        setData(activeBookings);
    }
    setIsLoading(false);
  };

  const handleAcceptBid = async (request, bid) => {
      Alert.alert("Accept Offer", `Confirm ${bid.offerAmount} Rs from ${bid.providerName}?`, [
          { text: "Cancel" },
          { text: "Accept", onPress: async () => {
             const { success, error } = await bookingService.acceptBid(request, bid);
             if(success) {
                 Alert.alert("Success", "Booking Confirmed!");
                 setActiveTab('bookings'); 
             } else {
                 Alert.alert("Error", error);
             }
          }}
      ]);
  };

  const handleChat = (request, providerId) => {
      navigation.navigate('ChatScreen', { 
        requestId: request.id, 
        chatTitle: request.serviceName,
        providerId: providerId 
      });
  };

  const handleSkipRating = (bookingId) => {
      Alert.alert("Skip Rating", "Move to history?", [
          { text: "Cancel" },
          { text: "Skip", onPress: async () => {
              const { success } = await bookingService.skipRating(bookingId);
              if (success) fetchData();
          }}
      ]);
  };

  // --- RENDER ITEMS ---

  const renderRequest = ({ item }) => (
    <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
            <View>
                <Text style={styles.cardTitle}>{item.serviceName}</Text>
                <Text style={styles.cardDate}>
                    Requested: {item.startTime ? new Date(item.startTime).toLocaleDateString() : 'N/A'}
                </Text>
            </View>
            <StatusBadge status="open" />
        </View>

        <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Your Budget</Text>
            <Text style={styles.budgetValue}>{item.offeredPrice} Rs</Text>
        </View>
        
        <Text style={styles.sectionHeader}>Received Bids ({item.bids ? item.bids.length : 0})</Text>
        
        {item.bids && item.bids.length > 0 ? (
            item.bids.map((bid, index) => (
                <View key={index} style={styles.bidCard}>
                    <View style={styles.bidHeader}>
                        <Text style={styles.providerName}>{bid.providerName}</Text>
                        <Text style={styles.bidPrice}>{bid.offerAmount} Rs</Text>
                    </View>
                    {bid.comment ? <Text style={styles.bidComment}>"{bid.comment}"</Text> : null}
                    
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleChat(item, bid.providerId)}>
                           <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptBid(item, bid)}>
                           <Text style={styles.acceptText}>Accept</Text>
                           <Ionicons name="checkmark" size={16} color="#FFF" style={{marginLeft: 4}} />
                        </TouchableOpacity>
                    </View>
                </View>
            ))
        ) : (
            <View style={styles.emptyBids}>
                <Text style={styles.emptyText}>Waiting for providers...</Text>
            </View>
        )}
    </View>
  );

  const renderBooking = ({ item }) => {
    const dateString = item.scheduleTime 
        ? new Date(item.scheduleTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
        : 'Date not available';

    return (
        <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
                <View style={{flex: 1}}>
                    <Text style={styles.cardTitle}>{item.serviceName}</Text>
                    <Text style={styles.cardSubTitle}>{item.providerName || 'Provider Assigned'}</Text>
                </View>
                <StatusBadge status={item.status} />
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.greyDark} />
                <Text style={styles.infoText}>{dateString}</Text>
            </View>
            <View style={styles.infoRow}>
                <Ionicons name="wallet-outline" size={16} color={COLORS.greyDark} />
                <Text style={styles.infoText}>{item.totalPrice} Rs</Text>
            </View>
            
            {/* Actions Area */}
            <View style={styles.footerActions}>
                {item.status === 'confirmed' && (
                    <TouchableOpacity 
                        style={styles.primaryActionBtn} 
                        onPress={() => navigation.navigate('LiveTrackingScreen', { bookingId: item.id, providerId: item.providerId })}
                    >
                        <Ionicons name="map" size={18} color="#FFF" style={{marginRight: 6}}/>
                        <Text style={styles.btnTextWhite}>Track Provider</Text>
                    </TouchableOpacity>
                )}

                {item.status === 'completed' && !item.ratingSubmitted && !item.ratingSkipped && (
                    <>
                        <TouchableOpacity 
                            style={[styles.primaryActionBtn, { backgroundColor: COLORS.secondary }]}
                            onPress={() => navigation.navigate('RateBookingScreen', { booking: item })}
                        >
                            <Ionicons name="star" size={18} color="#000" style={{marginRight: 6}}/>
                            <Text style={styles.btnTextDark}>Rate Service</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => handleSkipRating(item.id)} style={styles.skipBtn}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* --- 1. Modern Header --- */}
      <View style={styles.headerBackground}>
        <Text style={styles.headerTitle}>My Activity</Text>
      </View>

      {/* --- 2. Floating Tabs --- */}
      <View style={styles.tabContainerWrapper}>
          <View style={styles.tabContainer}>
              <TouchableOpacity 
                onPress={() => setActiveTab('requests')} 
                style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
              >
                  <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Negotiations</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setActiveTab('bookings')} 
                style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
              >
                  <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>Bookings</Text>
              </TouchableOpacity>
          </View>
      </View>

      {isLoading ? (
          <View style={styles.centerContainer}>
             <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
      ) : (
          <FlatList
            data={data}
            keyExtractor={item => item.id}
            renderItem={activeTab === 'requests' ? renderRequest : renderBooking}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={styles.centerContainer}>
                    <Ionicons name="folder-open-outline" size={60} color={COLORS.grey} />
                    <Text style={styles.emptyText}>No items found.</Text>
                </View>
            }
          />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Beige
  },
  // --- Header ---
  headerBackground: {
    backgroundColor: COLORS.primary, // Teal
    paddingTop: 60,
    paddingBottom: 50, // Space for tabs to overlap
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  // --- Floating Tabs ---
  tabContainerWrapper: {
    alignItems: 'center',
    marginTop: -25, // Pull up to overlap header
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 4,
    width: '85%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 22,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.greyDark,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  // --- List & Cards ---
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Modern Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  cardSubTitle: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 2,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.greyDark,
    marginTop: 2,
  },
  // --- Badges ---
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  // --- Request Specifics ---
  budgetContainer: {
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetLabel: { color: COLORS.greyDark, fontSize: 13 },
  budgetValue: { fontWeight: 'bold', fontSize: 15, color: COLORS.darkText },
  sectionHeader: {
    fontSize: 14, fontWeight: 'bold', color: COLORS.greyDark, marginBottom: 8, marginTop: 4,
  },
  // --- Bids ---
  bidCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  bidHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  providerName: { fontWeight: 'bold', color: COLORS.darkText },
  bidPrice: { fontWeight: 'bold', color: COLORS.primary },
  bidComment: { fontStyle: 'italic', color: '#666', fontSize: 12, marginBottom: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  iconBtn: { padding: 6, backgroundColor: '#F0F0F0', borderRadius: 8 },
  acceptBtn: { 
    backgroundColor: COLORS.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  acceptText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  emptyBids: { padding: 10, alignItems: 'center' },
  // --- Booking Info ---
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  infoText: { marginLeft: 8, color: COLORS.greyDark, fontSize: 14 },
  footerActions: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  primaryActionBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  btnTextWhite: { color: '#FFF', fontWeight: '600' },
  btnTextDark: { color: '#000', fontWeight: '600' },
  skipBtn: { padding: 10 },
  skipText: { color: COLORS.greyDark, textDecorationLine: 'underline' },
  
  // --- Misc ---
  centerContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: COLORS.greyDark, marginTop: 10, fontSize: 16 },
});

export default BookingStatusScreen;