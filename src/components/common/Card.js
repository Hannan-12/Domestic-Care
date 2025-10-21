// src/components/common/Card.js
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

/**
 * A reusable card component for wrapping content.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The content to display inside the card.
 * @param {object} [props.style] - Custom styles to merge with the default.
 */
const Card = ({ children, style = {} }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 5,
  },
});

export default Card;