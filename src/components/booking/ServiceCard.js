// src/components/booking/ServiceCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Card from '../common/Card';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
const ServiceCard = ({ service, onPress }) => {
  // Placeholder image from your assets
  const placeholderImage = require('../../assests/images/icon.jpeg'); // Adjusted path based on structure

  return (
    <TouchableOpacity onPress={() => onPress(service)} activeOpacity={0.8}>
      <Card style={styles.cardStyle}>
        <Image
          style={styles.image}
          source={
            service.imageUrl
              ? { uri: service.imageUrl }
              : placeholderImage 
          }
          resizeMode="cover"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{service.Name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {service.description || "Professional services at your doorstep."}
          </Text>
        </View>
        <View style={styles.iconContainer}>
           <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16, // Softer corners
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: COLORS.greyLight,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.greyDark,
    lineHeight: 18,
  },
  iconContainer: {
    paddingLeft: 8,
    justifyContent: 'center',
  },
});

export default ServiceCard;