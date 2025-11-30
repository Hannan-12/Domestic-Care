// src/screens/Booking/CreateRequestScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TextInput
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../api/bookingService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { COLORS } from '../../constants/colors';

const HOURLY_RATE = 50; 

const CreateRequestScreen = ({ route, navigation }) => {
  // Safe destructuring with defaults
  const { serviceName = 'Service', serviceId = 'unknown' } = route.params || {}; 
  const { user, profile } = useAuth();

  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 3600000)); // Default +1 hour
  const [comments, setComments] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(HOURLY_RATE);
  const [showPicker, setShowPicker] = useState({ show: false, mode: 'date', type: 'start' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Prevent NaN by ensuring dates are valid
    if (startDate && endDate) {
        const diffMs = endDate - startDate;
        const diffHrs = diffMs / (1000 * 60 * 60);
        let price = Math.max(1, Math.ceil(diffHrs)) * HOURLY_RATE;
        
        if (Number.isNaN(price)) price = HOURLY_RATE; // Fallback if calculation fails
        
        setEstimatedPrice(price);
    }
  }, [startDate, endDate]);

  const handleDateChange = (event, selectedDate) => {
    const currentType = showPicker.type;
    setShowPicker({ ...showPicker, show: false });

    if (selectedDate) {
      if (currentType === 'start') setStartDate(selectedDate);
      else setEndDate(selectedDate);
    }
  };

  const showMode = (mode, type) => {
    setShowPicker({ show: true, mode, type });
  };

  const handleSubmitRequest = async () => {
    if (!user) {
        Alert.alert("Error", "You must be logged in to make a request.");
        return;
    }
    if (!address) {
      Alert.alert('Missing Info', 'Please enter an address.');
      return;
    }
    
    setIsSubmitting(true);

    const requestData = {
      clientId: user.uid,
      clientName: profile?.name || 'Unknown Client',
      serviceId: serviceId,
      serviceName: serviceName,
      address: address,
      startTime: startDate,
      endTime: endDate,
      offeredPrice: estimatedPrice,
      comments: comments || '', // Ensure empty string if null
      status: 'open',
    };

    console.log("Submitting Request:", requestData);

    const { success, error } = await bookingService.createServiceRequest(requestData);
    
    setIsSubmitting(false);

    if (success) {
      Alert.alert('Success', 'Request Sent! Providers can now see your job.', [
          { 
            text: 'OK', 
            // --- FIX IS HERE: Navigate to Tab first, then Screen ---
            onPress: () => navigation.navigate('Bookings', { screen: 'BookingStatus' }) 
          }
      ]);
    } else {
      Alert.alert('Submission Error', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Request {serviceName}</Text>

        <Input label="Address" value={address} onChangeText={setAddress} placeholder="Enter your home address" />

        <Text style={styles.label}>Start Time</Text>
        <Button title={startDate.toLocaleString()} onPress={() => showMode('time', 'start')} type="secondary" />
        
        <Text style={styles.label}>End Time</Text>
        <Button title={endDate.toLocaleString()} onPress={() => showMode('time', 'end')} type="secondary" />

        {showPicker.show && (
          <DateTimePicker
            value={showPicker.type === 'start' ? startDate : endDate}
            mode={showPicker.mode}
            is24Hour={true}
            onChange={handleDateChange}
          />
        )}

        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Estimated Budget</Text>
          <Text style={styles.priceValue}>{estimatedPrice} Rs</Text>
        </View>

        <Text style={styles.label}>Comments (Max 200 chars)</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          value={comments}
          onChangeText={setComments}
          maxLength={200}
        />

        <Button 
            title={isSubmitting ? "Sending..." : "Send Request to Providers"} 
            onPress={handleSubmitRequest} 
            loading={isSubmitting}
            style={styles.btn} 
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 5 },
  priceBox: { backgroundColor: COLORS.secondary, padding: 15, borderRadius: 10, marginVertical: 20, alignItems: 'center' },
  priceLabel: { fontSize: 16, color: '#000' },
  priceValue: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  textArea: { borderWidth: 1, borderColor: COLORS.grey, borderRadius: 8, padding: 10, height: 100, textAlignVertical: 'top', backgroundColor: '#FFF' },
  btn: { marginTop: 30 }
});

export default CreateRequestScreen;