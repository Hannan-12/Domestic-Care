// src/constants/colors.js

// As per your SRS (UI-6), the color scheme is:
// deep teal, mustard yellow, beige.
// We will add some standard functional colors as well.

export const COLORS = {
  // Brand Palette
  primary: '#006270', // Deep Teal (for buttons, headers, active elements)
  secondary: '#FFC107', // Mustard Yellow (for accents, highlights)
  background: '#F5F5DC', // Beige (for screen backgrounds)
  
  // Neutral Palette
  white: '#FFFFFF',
  black: '#000000',
  darkText: '#333333', // For body text
  greyDark: '#555555', // For subheadings, less important text
  grey: '#CCCCCC', // For borders, dividers
  greyLight: '#EEEEEE', // For card backgrounds, inputs

  // Functional Colors
  success: '#28A745',
  danger: '#D9534F', // For errors, delete actions
  warning: '#FFC107', // Can be same as secondary
  info: '#17A2B8',
  
  // Other potential shades
  primaryLight: '#E0F2F1', // A light tint of the primary color
};