import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

/**
 * Help Center Screen (Module 5)
 *
 * @param {object} props
 * @param {object} props.navigation - React Navigation prop
 */
const HelpCenterScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>How can we help?</Text>

        <Card style={styles.menuCard}>
          <SupportMenuItem
            icon="help-circle-outline"
            label="FAQs & Help Guides (FR-19)"
            onPress={() => {
              /* Navigate to FAQs Screen */
            }}
          />
          <SupportMenuItem
            icon="chatbubble-ellipses-outline"
            label="24/7 Chatbot Support (FR-17)"
            onPress={() => {
              /* Navigate to Chatbot Screen */
            }}
          />
          <SupportMenuItem
            icon="call-outline"
            label="Call Center (FR-18)"
            onPress={() => {
              /* Initiate call or show number */
            }}
          />
          <SupportMenuItem
            icon="ticket-outline"
            label="Submit a Ticket (FR-20)"
            onPress={() => {
              /* Navigate to Ticket Submission Screen */
            }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const SupportMenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={COLORS.primary} />
    <Text style={styles.menuLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={24} color={COLORS.grey} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F5DC',
  },
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 16,
  },
  menuCard: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyLight,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkText,
    marginLeft: 16,
  },
});

export default HelpCenterScreen;
