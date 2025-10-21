// src/components/profile/AvailabilityCalendar.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../constants/colors';

/**
 * A component for providers to select their available days.
 *
 * @param {object} props
 * @param {object} props.markedDates - An object of marked dates for the calendar.
 * @param {function} props.onDayPress - Function called when a day is pressed.
 */
const AvailabilityCalendar = ({ markedDates, onDayPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Your Availability</Text>
      <Calendar
        style={styles.calendar}
        // Handler which gets executed on day press
        onDayPress={(day) => {
          // day object: { dateString: '2025-10-21', day: 21, month: 10, year: 2025, timestamp: ... }
          onDayPress(day.dateString);
        }}
        // Collection of marked dates
        markedDates={markedDates}
        // Theme for the calendar
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: COLORS.primary || '#006270',
          selectedDayTextColor: '#ffffff',
          todayTextColor: COLORS.primary || '#006270',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          arrowColor: COLORS.primary || '#006270',
          monthTextColor: COLORS.darkText || '#333333',
          indicatorColor: 'blue',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
      />
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.primary }]}
          />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText || '#333333',
    marginBottom: 10,
  },
  calendar: {
    borderWidth: 1,
    borderColor: COLORS.greyLight || '#EEEEEE',
    borderRadius: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.greyLight || '#EEEEEE',
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.greyDark || '#555555',
  },
});

export default AvailabilityCalendar;