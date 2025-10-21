// src/constants/dimensions.js
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const DIMENSIONS = {
  // Screen Dimensions
  screenWidth: screenWidth,
  screenHeight: screenHeight,

  // Spacing (based on an 8-point grid system)
  spacing: {
    xs: 4,  // Extra Small
    sm: 8,  // Small
    md: 16, // Medium (default padding)
    lg: 24, // Large
    xl: 32, // Extra Large
  },

  // Font Sizes
  font: {
    // As per your SRS (UI-7)
    sm: 12,
    md: 14, // Minimum readable font
    lg: 16, // General text
    xl: 18, // Headings
    title: 24,
  },

  // Border Radius
  radius: {
    sm: 4,
    md: 8,  // Standard for inputs/buttons
    lg: 12, // Standard for cards
    circle: 999,
  },

  // Header Height
  headerHeight: Platform.OS === 'ios' ? 100 : 60,
};