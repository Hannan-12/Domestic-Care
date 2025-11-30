// src/screens/Admin/AdminDashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestoreDB } from '../../api/firebase';
// 1. Import authService
import { authService } from '../../api/authService'; 
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const AdminDashboardScreen = ({ navigation }) => {
  const [pendingProviders, setPendingProviders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPending = async () => {
    setRefreshing(true);
    try {
      // Query providers with status 'pending'
      const q = query(
        collection(firestoreDB, 'users'), 
        where('role', '==', 'provider'),
        where('verificationStatus', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingProviders(data);
    } catch (e) {
      console.error(e);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleDecision = async (providerId, status) => {
    try {
      const userRef = doc(firestoreDB, 'users', providerId);
      await updateDoc(userRef, {
        verificationStatus: status, // 'approved' or 'rejected'
        isVerified: status === 'approved'
      });
      Alert.alert("Success", `Provider ${status} successfully.`);
      fetchPending();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  // 2. Define the logout handler
  const handleLogout = async () => {
    await authService.logout();
    // No need to navigate manually; AppNavigator will handle the switch to Login
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>Father: {item.fatherName}</Text>
      <Text>CNIC: {item.cnic}</Text>
      <View style={styles.imgRow}>
         {item.cnicFront && <Image source={{uri: item.cnicFront}} style={styles.cnicImg} />}
         {item.cnicBack && <Image source={{uri: item.cnicBack}} style={styles.cnicImg} />}
      </View>
      <View style={styles.btnRow}>
         <TouchableOpacity 
            style={[styles.btn, styles.rejectBtn]} 
            onPress={() => handleDecision(item.id, 'rejected')}>
            <Text style={styles.btnText}>Reject</Text>
         </TouchableOpacity>
         <TouchableOpacity 
            style={[styles.btn, styles.approveBtn]} 
            onPress={() => handleDecision(item.id, 'approved')}>
            <Text style={styles.btnText}>Approve</Text>
         </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        {/* 3. Update the onPress to call handleLogout */}
        <TouchableOpacity onPress={handleLogout} style={{padding: 5}}>
            <Text style={{color:'red'}}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subHeader}>Pending Approvals</Text>
      
      <FlatList
        data={pendingProviders}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={fetchPending}
        ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20}}>No pending requests.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  subHeader: { padding: 15, fontSize: 16, color: '#555' },
  card: { backgroundColor: '#fff', margin: 15, padding: 15, borderRadius: 10, elevation: 3 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  imgRow: { flexDirection: 'row', marginTop: 10 },
  cnicImg: { width: 100, height: 60, marginRight: 10, backgroundColor: '#eee' },
  btnRow: { flexDirection: 'row', marginTop: 15 },
  btn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 5, marginHorizontal: 5 },
  approveBtn: { backgroundColor: COLORS.success },
  rejectBtn: { backgroundColor: COLORS.danger },
  btnText: { color: '#fff', fontWeight: 'bold' }
});

export default AdminDashboardScreen;