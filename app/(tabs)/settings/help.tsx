import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../../../store/uiStore';
import { getTheme, spacing } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import { router } from 'expo-router';

type HelpSection = {
  title: string;
  items: HelpItem[];
};

type HelpItem = {
  icon: string;
  title: string;
  description: string;
  action: () => void;
};

export default function HelpScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@cryptoexchange.com');
  };

  const handleOpenChat = () => {
    // In a real app, this would open a chat interface
    console.log('Open chat support');
  };

  const handleOpenFAQ = () => {
    // In a real app, this would navigate to the FAQ page
    console.log('Open FAQ');
  };

  const handleOpenGuide = () => {
    // In a real app, this would navigate to the user guide
    console.log('Open user guide');
  };

  const helpSections: HelpSection[] = [
    {
      title: 'Contact Support',
      items: [
        {
          icon: 'chat',
          title: 'Live Chat',
          description: 'Chat with our support team',
          action: handleOpenChat,
        },
        {
          icon: 'email',
          title: 'Email Support',
          description: 'Send us an email',
          action: handleEmailSupport,
        },
      ],
    },
    {
      title: 'Self Help',
      items: [
        {
          icon: 'frequently-asked-questions',
          title: 'FAQ',
          description: 'Find answers to common questions',
          action: handleOpenFAQ,
        },
        {
          icon: 'book-open-page-variant',
          title: 'User Guide',
          description: 'Learn how to use the app',
          action: handleOpenGuide,
        },
      ],
    },
  ];

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
          Help & Support
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          How can we help you today?
        </Text>
      </View>

      {helpSections.map((section, sectionIndex) => (
        <View key={section.title} style={styles.section}>
          <Text variant="subtitle1" weight="semibold" style={styles.sectionTitle}>
            {section.title}
          </Text>
          <Card style={styles.sectionCard}>
            {section.items.map((item, itemIndex) => (
              <React.Fragment key={item.title}>
                <TouchableOpacity
                  style={styles.helpItem}
                  onPress={item.action}
                >
                  <View style={styles.helpItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={24}
                        color={theme.primary}
                      />
                    </View>
                    <View style={styles.helpItemText}>
                      <Text variant="body1" weight="semibold">{item.title}</Text>
                      <Text variant="body2" color="secondaryText">{item.description}</Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={theme.secondaryText}
                  />
                </TouchableOpacity>
                {itemIndex < section.items.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.border }]} />
                )}
              </React.Fragment>
            ))}
          </Card>
        </View>
      ))}

      <Card style={[styles.emergencyCard, { borderColor: theme.primary }]}>
        <MaterialCommunityIcons
          name="shield-alert"
          size={24}
          color={theme.primary}
          style={styles.emergencyIcon}
        />
        <Text variant="body1" weight="semibold" style={styles.emergencyTitle}>
          Account Security Issue?
        </Text>
        <Text variant="body2" color="secondaryText" style={styles.emergencyText}>
          If you suspect unauthorized access or have urgent security concerns, contact our security team immediately.
        </Text>
        <TouchableOpacity
          style={[styles.emergencyButton, { backgroundColor: theme.primary }]}
          onPress={handleEmailSupport}
        >
          <Text variant="button" style={{ color: '#fff' }}>
            Contact Security Team
          </Text>
        </TouchableOpacity>
      </Card>

      <Text variant="caption" color="secondaryText" style={styles.disclaimer}>
        Our support team is available 24/7 to assist you with any questions or concerns you may have.
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    marginHorizontal: spacing.md,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  helpItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  helpItemText: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  emergencyCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  emergencyIcon: {
    marginBottom: spacing.sm,
  },
  emergencyTitle: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emergencyText: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emergencyButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
  },
  disclaimer: {
    margin: spacing.lg,
    textAlign: 'center',
  },
}); 