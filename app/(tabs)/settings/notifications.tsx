import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../../../store/uiStore';
import { getTheme, spacing, radius } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';

type IconName = 'chart-line' | 'trending-up' | 'swap-horizontal' | 'bank-transfer' | 'shield-alert' | 'newspaper' | 'gift';

type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: IconName;
};

export default function NotificationsScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));
  
  // In a real app, these would be stored in a notifications store
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'price_alerts',
      title: 'Price Alerts',
      description: 'Get notified when cryptocurrencies hit your target price',
      enabled: true,
      icon: 'chart-line',
    },
    {
      id: 'market_updates',
      title: 'Market Updates',
      description: 'Daily updates about market trends and significant changes',
      enabled: true,
      icon: 'trending-up',
    },
    {
      id: 'trade_confirmations',
      title: 'Trade Confirmations',
      description: 'Receive notifications for successful trades',
      enabled: true,
      icon: 'swap-horizontal',
    },
    {
      id: 'deposit_withdrawals',
      title: 'Deposits & Withdrawals',
      description: 'Get notified about account deposits and withdrawals',
      enabled: true,
      icon: 'bank-transfer',
    },
    {
      id: 'security_alerts',
      title: 'Security Alerts',
      description: 'Important alerts about your account security',
      enabled: true,
      icon: 'shield-alert',
    },
    {
      id: 'news',
      title: 'News & Updates',
      description: 'Stay informed about crypto news and platform updates',
      enabled: false,
      icon: 'newspaper',
    },
    {
      id: 'promotions',
      title: 'Promotions',
      description: 'Receive information about special offers and promotions',
      enabled: false,
      icon: 'gift',
    },
  ]);

  const handleToggle = (id: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animatable.View 
        animation="fadeInDown" 
        duration={600} 
        style={styles.header}
        useNativeDriver
      >
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
          Notifications
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Choose which notifications you'd like to receive
        </Text>
      </Animatable.View>

      <Animatable.View
        animation="fadeInUp"
        duration={600}
        delay={300}
        useNativeDriver
      >
        <Card style={styles.settingsCard}>
          {settings.map((setting, index) => (
            <Animatable.View
              key={setting.id}
              animation="fadeIn"
              delay={index * 100}
              useNativeDriver
            >
              <View style={styles.settingItem}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                  <MaterialCommunityIcons
                    name={setting.icon}
                    size={24}
                    color={theme.primary}
                  />
                </View>
                <View style={styles.settingInfo}>
                  <Text variant="body1" weight="semibold">
                    {setting.title}
                  </Text>
                  <Text variant="body2" color="secondaryText" style={styles.description}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => handleToggle(setting.id)}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={setting.enabled ? theme.primary : theme.card}
                  ios_backgroundColor={theme.border}
                />
              </View>
              {index < settings.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              )}
            </Animatable.View>
          ))}
        </Card>

        <Text variant="caption" color="secondaryText" style={styles.disclaimer}>
          You can change these settings at any time. Some notifications cannot be disabled as they contain important information about your account.
        </Text>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xxxl + spacing.md : spacing.xxxl,
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
  settingsCard: {
    marginHorizontal: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  description: {
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  disclaimer: {
    margin: spacing.lg,
    textAlign: 'center',
    lineHeight: 18,
  },
}); 