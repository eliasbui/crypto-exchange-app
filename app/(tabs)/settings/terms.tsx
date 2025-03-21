import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../../../store/uiStore';
import { getTheme, spacing } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import { router } from 'expo-router';

type TermsSection = {
  title: string;
  content: string;
};

const termsContent: TermsSection[] = [
  {
    title: 'Acceptance of Terms',
    content: 'By accessing and using this cryptocurrency exchange app, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this app.',
  },
  {
    title: 'Eligibility',
    content: 'You must be at least 18 years old to use our services. By using our app, you represent and warrant that you have the right, authority, and capacity to enter into these terms and to abide by all of the terms and conditions set forth herein.',
  },
  {
    title: 'Account Registration',
    content: 'To use certain features of the app, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.',
  },
  {
    title: 'Trading Rules',
    content: 'All trading activities must comply with applicable laws and regulations. You are responsible for understanding and complying with all laws, rules, and regulations that may apply to your trading activities. We reserve the right to refuse any trading activity that we believe violates these rules.',
  },
  {
    title: 'Security',
    content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security.',
  },
  {
    title: 'Risk Disclosure',
    content: 'Cryptocurrency trading involves substantial risk of loss and is not suitable for all investors. You should carefully consider whether trading is suitable for you in light of your circumstances, knowledge, and financial resources.',
  },
  {
    title: 'Service Modifications',
    content: 'We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice. You agree that we will not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.',
  },
  {
    title: 'Limitation of Liability',
    content: 'To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.',
  },
];

export default function TermsScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={theme.text} 
          />
        </TouchableOpacity>
        <Text variant="h4" weight="bold" style={styles.title}>
          Terms of Service
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Last updated: March 2024
        </Text>
      </View>

      <Text variant="body1" style={styles.introduction}>
        Please read these Terms of Service carefully before using our cryptocurrency exchange app. These terms govern your use of our app and provide important information about your rights and obligations.
      </Text>

      {termsContent.map((section, index) => (
        <Card key={section.title} style={[styles.section, index === 0 && { marginTop: 0 }]}>
          <Text variant="subtitle1" weight="semibold" style={styles.sectionTitle}>
            {section.title}
          </Text>
          <Text variant="body2" style={styles.sectionContent}>
            {section.content}
          </Text>
        </Card>
      ))}

      <Card style={[styles.contactSection, { borderColor: theme.primary }]}>
        <MaterialCommunityIcons
          name="file-document-check"
          size={32}
          color={theme.primary}
          style={styles.contactIcon}
        />
        <Text variant="subtitle1" weight="semibold" style={styles.contactTitle}>
          Questions About Our Terms?
        </Text>
        <Text variant="body2" color="secondaryText" style={styles.contactText}>
          If you have any questions about these terms, please contact our legal team.
        </Text>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/settings/help')}
        >
          <Text variant="button" style={{ color: '#fff' }}>
            Contact Legal Team
          </Text>
        </TouchableOpacity>
      </Card>

      <Text variant="caption" color="secondaryText" style={styles.disclaimer}>
        By continuing to use our app, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  introduction: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  sectionContent: {
    lineHeight: 20,
  },
  contactSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  contactIcon: {
    marginBottom: spacing.sm,
  },
  contactTitle: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  contactText: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  contactButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 20,
  },
  disclaimer: {
    margin: spacing.lg,
    textAlign: 'center',
  },
}); 