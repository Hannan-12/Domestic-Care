// src/components/common/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo
import { COLORS } from '../../constants/colors';

/**
 * A reusable header component for screens.
 *
 * @param {object} props
 * @param {string} props.title - The title to display in the header.
 * @param {function} [props.onBackPress] - If provided, shows a back button and calls this function on press.
 * @param {React.ReactNode} [props.rightIcon] - An optional icon/component to display on the right.
 */
const Header = ({ title, onBackPress, rightIcon = null }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <Ionicons
              name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
              size={24}
              color={COLORS.primary || '#006270'}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>{rightIcon}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: Platform.OS === 'ios' ? 100 : 60,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyLight || '#EEEEEE',
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 3,
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  iconButton: {
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText || '#333333',
  },
});

export default Header;