// src/screens/Booking/RateBookingScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../api/profileService';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

// --- STYLES OBJECT MOVED HERE (THE FIX) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.greyDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
    marginTop: 16,
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 32,
  },
});
// --- END OF STYLES OBJECT ---

// A simple component for star ratings
const StarRating = ({ rating, onRate }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((index) => (
        <TouchableOpacity key={index} onPress={() => onRate(index)}>
          <Ionicons
            name={index <= rating ? 'star' : 'star-outline'}
            size={40}
            color={COLORS.secondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const RateBookingScreen = ({ route, navigation }) => {
  const { booking } = route.params; // Get the whole booking object
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a star rating (1-5).');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'You are not logged in.');
      return;
    }

    setIsLoading(true);

    const reviewData = {
      providerId: booking.providerId,
      clientId: user.uid,
      bookingId: booking.id,
      rating: rating,
      comment: comment,
    };

    // Use the profileService to submit the review
    const { reviewId, error } = await profileService.submitProviderReview(
      reviewData
    );

    setIsLoading(false);

    if (error) {
      Alert.alert('Submission Failed', error);
    } else {
      Alert.alert(
        'Review Submitted',
        'Thank you for your feedback!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Rate Your Service</Text>
        <Text style={styles.subtitle}>
          How was your experience with {booking.providerName}?
        </Text>

        <StarRating rating={rating} onRate={setRating} />

        <Text style={styles.label}>Add a Comment (Optional)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Tell us more about your experience..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
        />

        <Button
          title="Submit Review"
          onPress={handleSubmitReview}
          loading={isLoading}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RateBookingScreen;