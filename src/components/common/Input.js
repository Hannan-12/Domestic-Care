// src/components/common/Input.js
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors'; // We will create this file later

/**
 * A reusable text input component for forms.
 *
 * @param {object} props
 * @param {string} props.label - The label text to display above the input.
 * @param {string} props.value - The current value of the input.
 * @param {function} props.onChangeText - Function to call when text changes.
 * @param {string} [props.placeholder] - Placeholder text for the input.
 * @param {boolean} [props.secureTextEntry] - Whether to hide the text (for passwords).
 * @param {string} [props.error] - An error message to display below the input.
 * @param {object} [props.style] - Custom styles for the container.
 * @param {'default' | 'email-address' | 'numeric' | 'phone-pad'} [props.keyboardType] - The keyboard type.
 */
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error = null,
  style = {},
  keyboardType = 'default',
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    color: COLORS.darkText || '#333333',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.grey || '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputError: {
    borderColor: COLORS.danger || '#D9534F',
  },
  errorText: {
    color: COLORS.danger || '#D9534F',
    fontSize: 12,
    marginTop: 6,
  },
});

export default Input;