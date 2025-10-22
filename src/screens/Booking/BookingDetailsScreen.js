import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// You can replace this with data passed via navigation props (e.g., route.params.booking)
const placeholderBooking = {
  id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
  eventName: 'Annual Tech Conference 2025',
  eventImageUrl: 'https://via.placeholder.com/400x200.png?text=Event+Image',
  date: 'November 15, 2025',
  time: '9:00 AM - 5:00 PM',
  location: 'Grand Convention Center, Metropolis',
  userName: 'Hannan Hafeez',
  userEmail: 'hannan@example.com',
  qrCodeUrl: 'https://via.placeholder.com/200.png?text=QR+Code', // Placeholder for QR
};

// Helper component for displaying a single detail row
const DetailRow = ({icon, label, value}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailIcon}>{icon}</Text>
    <View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const BookingDetailScreen = ({route, navigation}) => {
  // If you pass data via navigation, use this:
  // const { booking } = route.params;
  // For now, we'll use the placeholder:
  const booking = placeholderBooking;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        {/* Event Image Header */}
        <Image
          source={{uri: booking.eventImageUrl}}
          style={styles.headerImage}
        />

        {/* --- Event Details --- */}
        <View style={styles.section}>
          <Text style={styles.eventName}>{booking.eventName}</Text>

          <DetailRow
            icon="📅"
            label="Date & Time"
            value={`${booking.date} at ${booking.time}`}
          />
          <DetailRow
            icon="📍"
            label="Location"
            value={booking.location}
          />
        </View>

        {/* --- Attendee Details --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendee</Text>
          <DetailRow
            icon="👤"
            label="Name"
            value={booking.userName}
          />
          <DetailRow
            icon="✉️"
            label="Email"
            value={booking.userEmail}
          />
        </View>

        {/* --- QR Code Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your E-Ticket</Text>
          <Text style={styles.qrSubtitle}>
            Show this QR code at the entrance
          </Text>
          <View style={styles.qrContainer}>
            {/* In a real app, you would use a library like 'react-native-qrcode-svg'
              e.g., <QRCode value={booking.id} size={200} />
            */}
            <Image
              source={{uri: booking.qrCodeUrl}}
              style={styles.qrCode}
            />
          </View>
        </View>

        {/* --- Action Button --- */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => alert('Cancel Booking Pressed')}>
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  container: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 16,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  cancelButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingDetailScreen;
