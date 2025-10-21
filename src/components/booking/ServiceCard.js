// src/components/booking/ServiceCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Card from '../common/Card';
import { COLORS } from '../../constants/colors';

/**
 * A card component to display a single service (e.g., Housekeeping).
 *
 * @param {object} props
 * @param {object} props.service - The service object.
 * @param {string} props.service.name - The name of the service.
 * @param {string} [props.service.description] - A short description.
 * @param {string} [props.service.imageUrl] - URL for the service image.
 * @param {function} props.onPress - Function to call when the card is pressed.
 */
const ServiceCard = ({ service, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(service)}>
      <Card style={styles.container}>
        <Image
          style={styles.image}
          source={
            service.imageUrl
              ? { uri: service.imageUrl }
              : require('../../assets/images/default-placeholder.png') // We'll add this asset later
          }
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{service.name}</Text>
          {service.description && (
            <Text style={styles.description} numberOfLines={2}>
              {service.description}
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: COLORS.greyLight || '#EEEEEE',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText || '#333333',
  },
  description: {
    fontSize: 14,
    color: COLORS.greyDark || '#555555',
    marginTop: 4,
  },
});

export default ServiceCard;