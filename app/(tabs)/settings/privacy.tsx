import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../../../store/uiStore';
import { getTheme, spacing } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import { router } from 'expo-router';

type PrivacySection = {
  title: string;
  content: string;
};

const privacyContent: PrivacySection[] = [
  {
    title: 'Information We Collect',
    content: 'We collect information that you provide directly to us, including your name, email address, phone number, and any other information you choose to provide. We also collect information automatically when you use our app, including your device information, IP address, and usage data.',
  },
  {
    title: 'How We Use Your Information',
    content: 'We use the information we collect to provide, maintain, and improve our services, to process your transactions, to communicate with you, and to protect our users. We may also use your information to personalize your experience and to provide you with marketing communications.',
  },
  {
    title: 'Information Sharing',
    content: 'We do not share your personal information with third parties except as described in this policy. We may share your information with service providers who assist us in providing our services, with law enforcement when required by law, and in connection with a business transfer.',
  },
  {
    title: 'Data Security',
    content: 'We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable and we cannot guarantee the security of our systems.',
  },
  {
    title: 'Your Rights',
    content: 'You have the right to access, update, or delete your personal information. You can also choose to opt-out of marketing communications. Contact us if you would like to exercise any of these rights.',
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the effective date.',
  },
];

export default function PrivacyScreen() {
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
          Privacy Policy
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Last updated: March 2024
        </Text>
      </View>

      <Text variant="body1" style={styles.introduction}>
        Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cryptocurrency exchange app.
      </Text>

      {privacyContent.map((section, index) => (
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
          name="shield-check"
          size={32}
          color={theme.primary}
          style={styles.contactIcon}
        />
        <Text variant="subtitle1" weight="semibold" style={styles.contactTitle}>
          Questions About Our Privacy Policy?
        </Text>
        <Text variant="body2" color="secondaryText" style={styles.contactText}>
          If you have any questions or concerns about our privacy practices, please contact our privacy team.
        </Text>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/settings/help')}
        >
          <Text variant="button" style={{ color: '#fff' }}>
            Contact Privacy Team
          </Text>
        </TouchableOpacity>
      </Card>

      <Text variant="caption" color="secondaryText" style={styles.disclaimer}>
        This privacy policy is effective as of March 2024 and will remain in effect except with respect to any changes in its provisions in the future.
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