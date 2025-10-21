// src/components/profile/SkillTag.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * A small tag component to display a skill.
 *
 * @param {object} props
 * @param {string} props.skillName - The name of the skill to display.
 * @param {boolean} [props.isSelected] - Whether the tag is in a "selected" state.
 * @param {function} [props.onPress] - Optional function to make the tag pressable.
 * @param {function} [props.onRemove] - Optional function to show a remove icon.
 */
const SkillTag = ({ skillName, isSelected = false, onPress, onRemove }) => {
  const containerStyles = [
    styles.container,
    isSelected ? styles.containerSelected : styles.containerDefault,
  ];
  const textStyles = [
    styles.text,
    isSelected ? styles.textSelected : styles.textDefault,
  ];

  const content = (
    <View style={containerStyles}>
      <Text style={textStyles}>{skillName}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeIcon}>
          <Ionicons
            name="close-circle"
            size={16}
            color={isSelected ? COLORS.primary : COLORS.greyDark}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
  },
  containerDefault: {
    backgroundColor: COLORS.greyLight || '#EEEEEE',
  },
  containerSelected: {
    backgroundColor: COLORS.primaryLight || '#E0F2F1', // A light version of primary
    borderColor: COLORS.primary || '#006270',
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
  },
  textDefault: {
    color: COLORS.greyDark || '#555555',
  },
  textSelected: {
    color: COLORS.primary || '#006270',
    fontWeight: '600',
  },
  removeIcon: {
    marginLeft: 8,
  },
});

export default SkillTag;