import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileService } from '../../api/profileService';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const ProviderReviewsScreen = ({ route }) => {
  const { provider } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const { reviews: data } = await profileService.getProviderReviews(provider.id);
    setReviews(data);
    setLoading(false);
  };

  const renderReview = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Ionicons 
              key={i} 
              name={i < item.rating ? "star" : "star-outline"} 
              size={16} 
              color={COLORS.secondary} 
            />
          ))}
        </View>
        <Text style={styles.date}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
        </Text>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{provider.name}</Text>
        <Text style={styles.bio}>{provider.experience || 'No description provided.'}</Text>
        <Text style={styles.summary}>{reviews.length} Review(s)</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => item.id}
          renderItem={renderReview}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No reviews yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  infoContainer: { padding: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderColor: COLORS.greyLight },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.darkText },
  bio: { fontSize: 16, color: COLORS.greyDark, marginVertical: 8 },
  summary: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  list: { padding: 16 },
  card: { padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stars: { flexDirection: 'row' },
  date: { color: COLORS.greyDark, fontSize: 12 },
  comment: { fontSize: 15, color: COLORS.darkText, lineHeight: 22 },
  empty: { textAlign: 'center', marginTop: 20, color: COLORS.greyDark }
});

export default ProviderReviewsScreen;