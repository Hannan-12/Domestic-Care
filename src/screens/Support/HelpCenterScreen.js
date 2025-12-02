// src/screens/Support/HelpCenterScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

/**
 * A modern, individual card for support options.
 */
const SupportOption = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity 
    style={styles.optionCard} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.iconCircle}>
      <Ionicons name={icon} size={24} color={COLORS.primary} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.arrowContainer}>
      <Ionicons name="chevron-forward" size={20} color={COLORS.greyDark} />
    </View>
  </TouchableOpacity>
);

const HelpCenterScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* --- Modern Header --- */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Help Center</Text>
        <Text style={styles.headerSubtitle}>We're here to assist you anytime.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* --- Hero Banner (Mustard) --- */}
        <View style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Need quick help?</Text>
            <Text style={styles.heroText}>Our support team is available 24/7 to solve your issues.</Text>
          </View>
          <Ionicons name="headset" size={50} color={COLORS.primary} style={{ opacity: 0.8 }} />
        </View>

        <Text style={styles.sectionLabel}>Select an option</Text>

        {/* --- Option Cards --- */}
        <SupportOption
          icon="book-outline"
          title="FAQs & Help Guides"
          subtitle="Find answers to common questions"
          onPress={() => navigation.navigate('FaqsScreen')}
        />

        <SupportOption
          icon="chatbubbles-outline"
          title="24/7 Chatbot Support"
          subtitle="Get instant answers from our bot"
          onPress={() => {
            /* Navigate to Chatbot */
          }}
        />

        <SupportOption
          icon="call-outline"
          title="Call Center"
          subtitle="Speak directly with an agent"
          onPress={() => {
            /* Call Action */
          }}
        />

        <SupportOption
          icon="ticket-outline"
          title="Submit a Ticket"
          subtitle="Report an issue or request help"
          onPress={() => {
            /* Navigate to Ticket Screen */
          }}
        />

        {/* --- Footer Info --- */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Domestic Care Services v1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background, // Beige
  },
  // Header Styles
  headerContainer: {
    backgroundColor: COLORS.primary, // Deep Teal
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
  },
  
  // Scroll Content
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // Hero Banner
  heroBanner: {
    backgroundColor: COLORS.secondary, // Mustard
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroContent: {
    flex: 1,
    marginRight: 10,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  heroText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  // Section Label
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 16,
    marginLeft: 4,
  },

  // Option Card Styles
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    // Soft Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight || '#E0F2F1', // Light Teal background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: COLORS.greyDark,
  },
  arrowContainer: {
    paddingLeft: 10,
  },

  // Footer
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.greyDark,
    fontSize: 12,
    opacity: 0.6,
  },
});

export default HelpCenterScreen;