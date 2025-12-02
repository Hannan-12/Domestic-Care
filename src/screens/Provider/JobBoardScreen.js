// src/screens/Provider/JobBoardScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, FlatList, Text, TextInput, Alert, StyleSheet, RefreshControl, TouchableOpacity, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingService } from '../../api/bookingService';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const JobBoardScreen = ({ navigation }) => { 
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [comment, setComment] = useState('');

  // --- Verification Check UI ---
  if (profile?.role === 'provider' && profile?.verificationStatus !== 'approved') {
    return (
       <SafeAreaView style={styles.verificationContainer}>
         <Ionicons name="shield-checkmark-outline" size={80} color={COLORS.grey} />
         <Text style={styles.verificationTitle}>Action Required</Text>
         <Text style={styles.verificationText}>
           {profile?.verificationStatus === 'pending' 
             ? "Your documents are currently under review. Please wait for admin approval." 
             : "You must verify your identity before you can bid on jobs."}
         </Text>
         <TouchableOpacity 
           style={styles.verifyButton}
           onPress={() => navigation.navigate('ProviderVerificationScreen')}
         >
           <Text style={styles.verifyButtonText}>Verify Identity Now</Text>
         </TouchableOpacity>
       </SafeAreaView>
    );
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setRefreshing(true);
    const { requests, error } = await bookingService.getOpenRequests();
    if (!error) setRequests(requests);
    setRefreshing(false);
  };

  const handleBid = async (requestId) => {
    if (!bidAmount) {
        Alert.alert("Missing Price", "Please enter your offer amount.");
        return;
    }
    
    const { success, error } = await bookingService.placeBid(
        requestId, 
        { uid: user.uid, name: profile.name, avatarUrl: profile.avatarUrl }, 
        bidAmount, 
        comment
    );
    
    if (success) {
      Alert.alert("Success", "Your bid has been sent!");
      setSelectedJobId(null);
      setBidAmount('');
      setComment('');
      loadJobs(); 
    } else {
      Alert.alert("Error", error);
    }
  };

  const startEditing = (item, myBid) => {
    setBidAmount(myBid.offerAmount.toString());
    setComment(myBid.comment);
    setSelectedJobId(item.id); 
  };

  // --- Render Item ---
  const renderJob = ({ item }) => {
    const myBid = item.bids?.find(b => b.providerId === user.uid);
    const isEditing = selectedJobId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
                <Ionicons name="briefcase" size={20} color={COLORS.primary} />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.serviceName}>{item.serviceName}</Text>
                <Text style={styles.clientName}>{item.clientName || 'Client'}</Text>
            </View>
            <View style={styles.priceTag}>
                <Text style={styles.priceText}>{item.offeredPrice} Rs</Text>
                <Text style={styles.estText}>Est. Budget</Text>
            </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.greyDark} />
            <Text style={styles.detailText}>{item.address}</Text>
        </View>
        <View style={styles.detailsRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.greyDark} />
            <Text style={styles.detailText}>
                {item.startTime ? new Date(item.startTime).toLocaleDateString() : 'Flexible'}
            </Text>
        </View>
        
        {item.comments ? (
            <Text style={styles.commentText}>"{item.comments}"</Text>
        ) : null}

        {/* --- Bidding Section --- */}
        <View style={styles.actionSection}>
            {isEditing ? (
              <View style={styles.editForm}>
                <Text style={styles.formLabel}>{myBid ? 'Update Offer' : 'Place Your Bid'}</Text>
                <View style={styles.inputRow}>
                    <TextInput 
                      placeholder="Price (Rs)" 
                      style={[styles.input, { flex: 0.4 }]} 
                      keyboardType="numeric" 
                      value={bidAmount}
                      onChangeText={setBidAmount}
                    />
                    <TextInput 
                      placeholder="Short comment..." 
                      style={[styles.input, { flex: 0.6 }]} 
                      value={comment}
                      onChangeText={setComment}
                    />
                </View>
                <View style={styles.formBtnRow}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedJobId(null)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitBtn} onPress={() => handleBid(item.id)}>
                        <Text style={styles.submitText}>Send Bid</Text>
                    </TouchableOpacity>
                </View>
              </View>
            ) : myBid ? (
                <View style={styles.bidStatusBox}>
                    <View>
                        <Text style={styles.bidStatusTitle}>Bid Sent</Text>
                        <Text style={styles.bidStatusAmount}>Your Offer: {myBid.offerAmount} Rs</Text>
                    </View>
                    <TouchableOpacity style={styles.editBtn} onPress={() => startEditing(item, myBid)}>
                        <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            ) : (
              <TouchableOpacity 
                style={styles.placeBidBtn} 
                onPress={() => { setBidAmount(''); setComment(''); setSelectedJobId(item.id); }}
              >
                <Text style={styles.placeBidText}>Place a Bid</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
       <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
       
       {/* --- Header --- */}
       <View style={styles.headerBackground}>
         <Text style={styles.headerTitle}>Job Board</Text>
         <Text style={styles.headerSubtitle}>Find your next opportunity</Text>
       </View>

       {/* --- Summary Banner (Mustard) --- */}
       <View style={styles.summaryBanner}>
          <View>
             <Text style={styles.bannerTitle}>Open Requests</Text>
             <Text style={styles.bannerSubtitle}>{requests.length} jobs available for bidding</Text>
          </View>
          <Ionicons name="megaphone-outline" size={32} color={COLORS.darkText} />
       </View>

       <FlatList 
         data={requests} 
         renderItem={renderJob} 
         keyExtractor={item => item.id}
         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadJobs} />}
         contentContainerStyle={styles.listContent}
         showsVerticalScrollIndicator={false}
         ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="briefcase-outline" size={60} color={COLORS.grey} />
                <Text style={styles.emptyText}>No open jobs right now.</Text>
            </View>
         }
       />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  // --- Header Styles ---
  headerBackground: {
    backgroundColor: COLORS.primary, // Teal
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  // --- Banner ---
  summaryBanner: {
    backgroundColor: COLORS.secondary, // Mustard
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 10,
  },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText },
  bannerSubtitle: { fontSize: 13, color: COLORS.darkText },

  // --- Verification ---
  verificationContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: COLORS.background },
  verificationTitle: { fontSize: 22, fontWeight: 'bold', marginVertical: 10, color: COLORS.darkText },
  verificationText: { textAlign: 'center', color: COLORS.greyDark, marginBottom: 20 },
  verifyButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25 },
  verifyButtonText: { color: '#FFF', fontWeight: 'bold' },

  // --- Card Styles ---
  listContent: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#E0F2F1', // Light Teal
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: COLORS.darkText },
  clientName: { fontSize: 12, color: COLORS.greyDark },
  priceTag: { alignItems: 'flex-end' },
  priceText: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
  estText: { fontSize: 10, color: COLORS.greyDark },
  
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
  
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { marginLeft: 8, fontSize: 13, color: COLORS.greyDark },
  commentText: { fontSize: 13, fontStyle: 'italic', color: '#666', marginTop: 4, marginBottom: 12 },

  // --- Action Section ---
  actionSection: { marginTop: 8 },
  placeBidBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  placeBidText: { color: '#FFF', fontWeight: 'bold', marginRight: 8 },

  // --- Form ---
  editForm: { backgroundColor: '#FAFAFA', padding: 10, borderRadius: 8 },
  formLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.greyDark, marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  input: {
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 14
  },
  formBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  cancelText: { color: COLORS.greyDark, fontSize: 13 },
  submitBtn: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  // --- Bid Status ---
  bidStatusBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#E8F5E9', padding: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: COLORS.success
  },
  bidStatusTitle: { fontSize: 12, color: COLORS.success, fontWeight: 'bold' },
  bidStatusAmount: { fontSize: 14, fontWeight: 'bold', color: COLORS.darkText },
  editBtn: { padding: 4 },

  // --- Empty ---
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: COLORS.greyDark, marginTop: 10 },
});

export default JobBoardScreen;