// src/screens/Support/FaqsScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';

/**
 * A helper component to render each FAQ item
 */
const FaqItem = ({ question, answer }) => (
  <View style={styles.faqItem}>
    <Text style={styles.question}>Q: {question}</Text>
    <Text style={styles.answer}>A: {answer}</Text>
  </View>
);

/**
 * A helper component for Help Guide sections
 */
const HelpGuideSection = ({ title, steps }) => (
  <View style={styles.guideSection}>
    <Text style={styles.guideTitle}>{title}</Text>
    {steps.map((step, index) => (
      <Text key={index} style={styles.answer}>
        • {step}
      </Text>
    ))}
  </View>
);

/**
 * Screen to display FAQs and Help Guides.
 * It conditionally renders content based on user role.
 */
const FaqsScreen = () => {
  const { profile } = useAuth();
  const isProvider = profile.role === 'provider';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {isProvider ? <ProviderContent /> : <ClientContent />}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Content for Clients ---
const ClientContent = () => (
  <>
    <Text style={styles.title}>Client FAQs & Help Guide</Text>

    <Text style={styles.header}>Frequently Asked Questions</Text>
    <FaqItem
      question="How do I book a service?"
      answer="Go to the 'Home' tab, select the service you need, choose an available provider, and then pick a date and time to schedule your booking."
    />
    <FaqItem
      question="How can I see my booking status?"
      answer="All your bookings are in the 'Bookings' tab. You can see if a booking is 'Confirmed,' 'In-Progress,' 'Completed,' or 'Cancelled'."
    />
    <FaqItem
      question="How do I cancel a booking?"
      answer="Go to the 'Bookings' tab. If your booking is 'Confirmed', tap the 'Cancel' button on the booking card and confirm."
    />
    <FaqItem
      question="How do I track my provider?"
      answer="In the 'Bookings' tab, tap the 'Track' button on any 'Confirmed' or 'In-Progress' booking to see a live map of your provider's location."
    />

    <Text style={styles.header}>Help Guide</Text>
    <HelpGuideSection
      title="How to Make a Booking"
      steps={[
        "Tap the 'Home' tab.",
        "Select the service you need (e.g., 'Pet Care').",
        "Browse the list of available providers and tap one to select them.",
        "On the 'Schedule' screen, pick a date and time.",
        "Add any custom notes and tap 'Confirm Booking'.",
      ]}
    />
    <HelpGuideSection
      title="How to Manage Your Bookings"
      steps={[
        "Tap the 'Bookings' tab (calendar icon).",
        "To Track: If a booking is 'Confirmed,' tap the 'Track' button.",
        "To Cancel: If a booking is 'Confirmed,' tap the 'Cancel' button.",
      ]}
    />
  </>
);

// --- Content for Providers ---
const ProviderContent = () => (
  <>
    <Text style={styles.title}>Provider FAQs & Help Guide</Text>

    <Text style={styles.header}>Frequently Asked Questions</Text>
    <FaqItem
      question="How do I get jobs? Clients can't see me."
      answer="You must set up your profile! Go to 'Profile' > 'Manage Skills' and add all the services you offer. Clients will not find you until you do this."
    />
    <FaqItem
      question="How do I set my schedule or take a day off?"
      answer="Go to 'Profile' > 'Manage Availability'. Tap on the calendar days you are available to work. If a day is not selected, clients cannot book you."
    />
    <FaqItem
      question="How do I see my assigned jobs?"
      answer="All your assigned jobs are shown on your 'Dashboard' tab (the briefcase icon). This is your main screen for managing your work."
    />
    <FaqItem
      question="How do I cancel a job I can't make?"
      answer="Go to your 'Dashboard' tab, find the 'Confirmed' booking, and tap the 'Cancel Booking' button. This will notify the client."
    />

    <Text style={styles.header}>Help Guide</Text>
    <HelpGuideSection
      title="Your First-Time Setup (Very Important!)"
      steps={[
        "After logging in, go to the 'Profile' tab.",
        "Tap 'Manage Skills': Select every service you are qualified to do and tap 'Save.'",
        "Tap 'Manage Availability': Select all the days you are able to work and tap 'Save.'",
        "You will not appear in client searches until you complete these two steps.",
      ]}
    />
    <HelpGuideSection
      title="How to Manage Your Jobs"
      steps={[
        "Tap the 'Dashboard' tab (briefcase icon).",
        "This screen shows all your assigned bookings with client and service details.",
        "To Cancel: If a job is 'Confirmed,' tap the 'Cancel Booking' button.",
      ]}
    />
  </>
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
    marginBottom: 24,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyLight,
    paddingBottom: 4,
  },
  faqItem: {
    marginVertical: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  answer: {
    fontSize: 15,
    color: COLORS.greyDark,
    lineHeight: 22,
  },
  guideSection: {
    marginVertical: 12,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 10,
  },
});

export default FaqsScreen;