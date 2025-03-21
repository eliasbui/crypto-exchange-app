import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../../../store/uiStore';
import { getTheme, spacing } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import { router } from 'expo-router';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';

type SocialLink = {
  icon: string;
  name: string;
  url: string;
};

const socialLinks: SocialLink[] = [
  {
    icon: 'twitter',
    name: 'Twitter',
    url: 'https://twitter.com/cryptoexchange',
  },
  {
    icon: 'facebook',
    name: 'Facebook',
    url: 'https://facebook.com/cryptoexchange',
  },
  {
    icon: 'instagram',
    name: 'Instagram',
    url: 'https://instagram.com/cryptoexchange',
  },
  {
    icon: 'linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/cryptoexchange',
  },
  {
    icon: 'github',
    name: 'GitHub',
    url: 'https://github.com/cryptoexchange',
  },
];

export default function AboutScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

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
          About
        </Text>
      </View>

      <View style={styles.logoSection}>
        <View style={[styles.logoContainer, { backgroundColor: theme.primary + '20' }]}>
          <MaterialCommunityIcons 
            name="currency-btc" 
            size={64} 
            color={theme.primary} 
          />
        </View>
        <Text variant="h3" weight="bold" style={styles.appName}>
          Crypto Exchange
        </Text>
        <Text variant="body1" color="secondaryText">
          Version {APP_VERSION} ({BUILD_NUMBER})
        </Text>
      </View>

      <Card style={styles.infoCard}>
        <Text variant="body1" style={styles.description}>
          A secure and user-friendly cryptocurrency exchange platform. Trade your favorite cryptocurrencies with confidence.
        </Text>
      </Card>

      <View style={styles.section}>
        <Text variant="subtitle1" weight="semibold" style={styles.sectionTitle}>
          Connect With Us
        </Text>
        <Card style={styles.socialLinks}>
          {socialLinks.map((link, index) => (
            <React.Fragment key={link.name}>
              <TouchableOpacity
                style={styles.socialItem}
                onPress={() => handleOpenLink(link.url)}
              >
                <View style={styles.socialItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <MaterialCommunityIcons
                      name={link.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <Text variant="body1">{link.name}</Text>
                </View>
                <MaterialCommunityIcons
                  name="open-in-new"
                  size={20}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>
              {index < socialLinks.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              )}
            </React.Fragment>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="subtitle1" weight="semibold" style={styles.sectionTitle}>
          Legal
        </Text>
        <Card style={styles.legalLinks}>
          <TouchableOpacity
            style={styles.legalItem}
            onPress={() => router.push('/settings/privacy')}
          >
            <Text variant="body1">Privacy Policy</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.secondaryText}
            />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity
            style={styles.legalItem}
            onPress={() => router.push('/settings/terms')}
          >
            <Text variant="body1">Terms of Service</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.secondaryText}
            />
          </TouchableOpacity>
        </Card>
      </View>

      <TouchableOpacity
        style={[styles.supportButton, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/settings/help')}
      >
        <MaterialCommunityIcons
          name="lifebuoy"
          size={20}
          color="#fff"
          style={styles.supportIcon}
        />
        <Text variant="button" style={{ color: '#fff' }}>
          Get Support
        </Text>
      </TouchableOpacity>

      <Text variant="caption" color="secondaryText" style={styles.copyright}>
        © 2024 Crypto Exchange. All rights reserved.
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
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    marginBottom: spacing.xs,
  },
  infoCard: {
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  socialLinks: {
    marginHorizontal: spacing.md,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  socialItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  legalLinks: {
    marginHorizontal: spacing.md,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 25,
  },
  supportIcon: {
    marginRight: spacing.sm,
  },
  copyright: {
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
}); 