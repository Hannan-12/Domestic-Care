// src/components/common/Button.js
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors'; // We will create this file later

/**
 * A reusable button component for the app.
 *
 * @param {object} props
 * @param {string} props.title - The text to display on the button.
 * @param {function} props.onPress - The function to call when pressed.
 * @param {boolean} [props.disabled] - Whether the button is disabled.
 * @param {boolean} [props.loading] - Whether to show a loading spinner.
 * @param {object} [props.style] - Custom styles to merge with default.
 * @param {object} [props.textStyle] - Custom styles for the button text.
 * @param {'primary' | 'secondary'} [props.type] - Button type for styling.
 */
const Button = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style = {},
  textStyle = {},
  type = 'primary',
}) => {
  const getButtonStyles = () => {
    switch (type) {
      case 'secondary':
        return styles.secondaryButton;
      case 'primary':
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'secondary':
        return styles.secondaryText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        getButtonStyles(),
        (isDisabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator
          color={type === 'primary' ? '#FFFFFF' : COLORS.primary}
        />
      ) : (
        <Text style={[styles.textBase, getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary || '#006270', // Fallback color
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary || '#006270',
  },
  disabled: {
    opacity: 0.6,
  },
  textBase: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: COLORS.primary || '#006270',
  },
});

export default Button;