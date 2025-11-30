// src/screens/Booking/BookingStatusScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../api/bookingService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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
        setData(result.bookings);
    }
    setIsLoading(false);
  };

  const handleAcceptBid = async (request, bid) => {
      Alert.alert("Accept Bid", `Accept offer of ${bid.offerAmount} Rs from ${bid.providerName}?`, [
          { text: "Cancel" },
          { text: "Accept", onPress: async () => {
             const { success, error } = await bookingService.acceptBid(request, bid);
             if(success) {
                 Alert.alert("Success", "Bid Accepted! Booking Confirmed.");
                 setActiveTab('bookings'); 
             } else {
                 Alert.alert("Error", error);
             }
          }}
      ]);
  };

  // NEW: Opens chat specific to the selected provider
  const handleChat = (request, providerId) => {
      navigation.navigate('ChatScreen', { 
        requestId: request.id, 
        chatTitle: request.serviceName,
        providerId: providerId 
      });
  };

  const renderRequest = ({ item }) => (
    <Card style={styles.card}>
        <Text style={styles.title}>{item.serviceName}</Text>
        <Text>Status: Open for Bids</Text>
        <Text style={{fontStyle:'italic'}}>My Budget: {item.offeredPrice}</Text>
        
        {item.startTime && (
           <Text style={{fontSize: 12, color: '#555'}}>
             Requested for: {new Date(item.startTime).toLocaleString()}
           </Text>
        )}
        
        <Text style={styles.sectionHeader}>Bids Received ({item.bids ? item.bids.length : 0})</Text>
        {item.bids && item.bids.length > 0 ? (
            item.bids.map((bid, index) => (
                <View key={index} style={styles.bidRow}>
                    <Text style={{fontWeight:'bold'}}>{bid.providerName}: {bid.offerAmount} Rs</Text>
                    <Text style={{fontSize:12, color:'#555'}}>{bid.comment}</Text>
                    
                    {/* NEW: Action Buttons for specific bid */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity 
                          style={styles.chatIconBtn} 
                          onPress={() => handleChat(item, bid.providerId)}
                        >
                           <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
                           <Text style={styles.iconText}>Chat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.acceptBtn} 
                          onPress={() => handleAcceptBid(item, bid)}
                        >
                           <Text style={styles.acceptText}>Accept Offer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))
        ) : <Text style={{color: COLORS.greyDark, fontStyle: 'italic'}}>Waiting for providers to bid...</Text>}
    </Card>
  );

  const renderBooking = ({ item }) => {
    const dateString = item.scheduleTime 
        ? new Date(item.scheduleTime).toLocaleString()
        : 'Date not available';

    return (
        <Card style={styles.card}>
        <Text style={styles.title}>{item.serviceName}</Text>
        <Text style={{color: COLORS.success, fontWeight:'bold'}}>{item.status.toUpperCase()}</Text>
        <Text>Date: {dateString}</Text> 
        <Text>Price: {item.totalPrice} Rs</Text>
        {item.status === 'confirmed' && (
            <Button title="Track Provider" onPress={() => navigation.navigate('LiveTrackingScreen', { bookingId: item.id, providerId: item.providerId })} style={{marginTop:10}}/>
        )}
        </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => setActiveTab('requests')} style={[styles.tab, activeTab === 'requests' && styles.activeTab]}>
              <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Negotiations</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('bookings')} style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}>
              <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>Bookings</Text>
          </TouchableOpacity>
      </View>

      {isLoading ? <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop:50}} /> : (
          <FlatList
            data={data}
            keyExtractor={item => item.id}
            renderItem={activeTab === 'requests' ? renderRequest : renderBooking}
            contentContainerStyle={{padding: 16}}
            ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>No items found.</Text>}
          />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  tab: { flex: 1, padding: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderColor: COLORS.primary },
  tabText: { color: COLORS.greyDark },
  activeTabText: { color: COLORS.primary, fontWeight: 'bold' },
  card: { padding: 16, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  sectionHeader: { marginTop: 15, marginBottom: 8, fontWeight: 'bold', color: COLORS.darkText },
  bidRow: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: COLORS.greyLight },
  actionRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'flex-end', alignItems: 'center' },
  chatIconBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 15, padding: 5 },
  iconText: { color: COLORS.primary, fontWeight: 'bold', marginLeft: 5, fontSize: 14 },
  acceptBtn: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  acceptText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});

export default BookingStatusScreen;