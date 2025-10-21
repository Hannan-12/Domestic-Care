// src/components/booking/DatePicker.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/colors';

/**
 * A reusable date and time picker component.
 *
 * @param {object} props
 * @param {Date} props.date - The currently selected date.
 * @param {function} props.onDateChange - Function called when the date is changed.
 * @param {'date' | 'time' | 'datetime'} [props.mode] - The picker mode.
 */
const DatePicker = ({ date, onDateChange, mode = 'date' }) => {
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios'); // On iOS, the picker is a modal
    onDateChange(currentDate);
  };

  const showMode = () => {
    setShow(true);
  };

  const getFormattedDate = () => {
    if (mode === 'date') {
      return date.toLocaleDateString();
    }
    if (mode === 'time') {
      return date.toLocaleTimeString();
    }
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      {/* This button is the main UI for Android */}
      <TouchableOpacity onPress={showMode} style={styles.pickerButton}>
        <Text style={styles.pickerText}>{getFormattedDate()}</Text>
      </TouchableOpacity>

      {/* The DateTimePicker modal */}
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  pickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.grey || '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.darkText || '#333333',
  },
});

export default DatePicker;