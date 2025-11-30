// src/screens/Provider/JobBoardScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, FlatList, Text, TextInput, Alert, StyleSheet, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingService } from '../../api/bookingService';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

const JobBoardScreen = ({ navigation }) => { 
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [comment, setComment] = useState('');

  if (profile?.role === 'provider' && profile?.verificationStatus !== 'approved') {
    return (
       <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
         <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: COLORS.darkText }}>
            Action Required
         </Text>
         <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16, color: COLORS.greyDark, paddingHorizontal: 20 }}>
           {profile?.verificationStatus === 'pending' 
             ? "Your documents are currently under review. You cannot bid yet." 
             : "You must verify your identity before bidding."}
         </Text>
         <Button 
           title="Verify Identity Now" 
           onPress={() => navigation.navigate('ProviderVerificationScreen')} 
           style={{ width: '80%' }}
         />
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
      Alert.alert("Success", "Your bid has been updated!");
      setSelectedJobId(null);
      setBidAmount('');
      setComment('');
      loadJobs(); 
    } else {
      Alert.alert("Error", error);
    }
  };

  // NEW: Provider enters chat with their OWN providerId
  const handleChat = (item) => {
      navigation.navigate('ChatScreen', { 
          requestId: item.id, 
          chatTitle: item.clientName || item.serviceName,
          providerId: user.uid 
      });
  };

  const startEditing = (item, myBid) => {
    setBidAmount(myBid.offerAmount.toString());
    setComment(myBid.comment);
    setSelectedJobId(item.id); 
  };

  const renderJob = ({ item }) => {
    const myBid = item.bids?.find(b => b.providerId === user.uid);
    const isEditing = selectedJobId === item.id;

    return (
      <Card style={styles.card}>
        <View style={styles.headerRow}>
            <Text style={styles.title}>{item.serviceName}</Text>
            <Text style={styles.priceTag}>Est: {item.offeredPrice} Rs</Text>
        </View>
        <Text style={styles.address}>📍 {item.address}</Text>
        <Text style={styles.time}>📅 {item.startTime ? new Date(item.startTime).toLocaleDateString() : ''}</Text>
        <Text style={styles.desc}>"{item.comments}"</Text>

        {isEditing ? (
          <View style={styles.bidForm}>
            <Text style={styles.formTitle}>{myBid ? 'Edit Your Offer' : 'Your Offer'}</Text>
            <TextInput 
              placeholder="Your Price (Rs)" 
              style={styles.input} 
              keyboardType="numeric" 
              value={bidAmount}
              onChangeText={setBidAmount}
            />
            <TextInput 
              placeholder="Comments" 
              style={styles.input} 
              value={comment}
              onChangeText={setComment}
            />
            <View style={styles.btnRow}>
                <Button title="Update Bid" onPress={() => handleBid(item.id)} style={{flex:1, marginRight: 5}}/>
                <Button title="Cancel" onPress={() => setSelectedJobId(null)} type="secondary" style={{flex:1}}/>
            </View>
          </View>
        ) : myBid ? (
            <View style={styles.alreadyBid}>
                <Text style={styles.bidText}>You offered: {myBid.offerAmount} Rs</Text>
                <Text style={styles.statusText}>Waiting for Client Response</Text>
                <View style={styles.btnRow}>
                    <Button title="Chat with Client" onPress={() => handleChat(item)} type="secondary" style={{ flex: 1, marginRight: 5 }} />
                    <Button title="Edit Bid" onPress={() => startEditing(item, myBid)} type="primary" style={{ flex: 1 }} />
                </View>
            </View>
        ) : (
          <Button title="Place a Bid" onPress={() => { setBidAmount(''); setComment(''); setSelectedJobId(item.id); }} type="secondary" style={{marginTop: 10}} />
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
       <FlatList 
         data={requests} 
         renderItem={renderJob} 
         keyExtractor={item => item.id}
         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadJobs} />}
         contentContainerStyle={{paddingBottom: 20}}
         ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20}}>No open jobs currently.</Text>}
       />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  card: { padding: 16, marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5},
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  priceTag: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
  address: { color: COLORS.greyDark, marginBottom: 4 },
  time: { color: COLORS.greyDark, marginBottom: 8 },
  desc: { fontStyle: 'italic', color: '#555', marginBottom: 8 },
  bidForm: { marginTop: 10, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  formTitle: { fontWeight: 'bold', marginBottom: 8},
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 8, backgroundColor: '#fff' },
  btnRow: { flexDirection: 'row', marginTop: 10 },
  alreadyBid: { backgroundColor: '#E0F2F1', padding: 10, borderRadius: 5, marginTop: 10 },
  bidText: { fontWeight: 'bold', color: COLORS.primary },
  statusText: { fontSize: 12, color: COLORS.greyDark }
});

export default JobBoardScreen;