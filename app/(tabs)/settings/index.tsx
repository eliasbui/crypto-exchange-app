import React from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { getTheme, spacing, radius } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import { router } from 'expo-router';

// Define setting sections and items
type SettingItem = {
  icon: string;
  title: string;
  subtitle?: string;
  action: 'toggle' | 'navigate' | 'action';
  value?: boolean;
  route?: string;
  onPress?: () => void;
};

export default function SettingsScreen() {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  const { toggleTheme } = useUIStore();
  const { logout, user, isBiometricEnabled, isPinEnabled, isOtpEnabled } = useAuthStore();
  
  // Handle logout action
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => {
            logout();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };
  
  // Define settings sections
  const profileSettings: SettingItem[] = [
    {
      icon: 'account',
      title: 'Profile',
      subtitle: 'View and edit your profile',
      action: 'navigate',
      route: '/(tabs)/settings/profile',
    },
    {
      icon: 'bell',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      action: 'navigate',
      route: '/(tabs)/settings/notifications',
    },
  ];

  const securitySettings: SettingItem[] = [
    {
      icon: 'fingerprint',
      title: 'Biometric Authentication',
      subtitle: isBiometricEnabled ? 'Enabled' : 'Disabled',
      action: 'navigate',
      route: '/(tabs)/settings/auth-settings',
    },
    {
      icon: 'pin',
      title: 'PIN Code',
      subtitle: isPinEnabled ? 'Change PIN code' : 'Set up PIN code',
      action: 'navigate',
      route: '/(tabs)/settings/setup-pin',
    },
    {
      icon: 'email',
      title: 'Two-Factor Authentication',
      subtitle: isOtpEnabled ? 'Enabled' : 'Disabled',
      action: 'navigate',
      route: '/(tabs)/settings/auth-settings',
    },
  ];
  
  const appSettings: SettingItem[] = [
    {
      icon: 'theme-light-dark',
      title: 'Dark Mode',
      action: 'toggle',
      value: themeType === 'dark',
      onPress: toggleTheme,
    },
    {
      icon: 'translate',
      title: 'Language',
      subtitle: 'English',
      action: 'navigate',
      route: '/(tabs)/settings/language',
    },
  ];
  
  const accountSettings: SettingItem[] = [
    {
      icon: 'help-circle',
      title: 'Help & Support',
      action: 'navigate',
      route: '/(tabs)/settings/help',
    },
    {
      icon: 'shield-check',
      title: 'Privacy Policy',
      action: 'navigate',
      route: '/(tabs)/settings/privacy',
    },
    {
      icon: 'file-document',
      title: 'Terms of Service',
      action: 'navigate',
      route: '/(tabs)/settings/terms',
    },
    {
      icon: 'information',
      title: 'About',
      action: 'navigate',
      route: '/(tabs)/settings/about',
    },
    {
      icon: 'logout',
      title: 'Logout',
      action: 'action',
      onPress: handleLogout,
    },
  ];
  
  // Render a setting item
  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.settingItem, { borderBottomColor: theme.border }]}
      onPress={() => {
        if (item.action === 'navigate' && item.route) {
          router.push(item.route as any);
        } else if (item.action === 'action' && item.onPress) {
          item.onPress();
        }
      }}
      disabled={item.action === 'toggle'}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
          <MaterialCommunityIcons
            name={item.icon as any}
            size={22}
            color={theme.primary}
          />
        </View>
        <View style={styles.settingText}>
          <Text variant="subtitle1" weight="semibold">{item.title}</Text>
          {item.subtitle && (
            <Text variant="body2" color="secondaryText">{item.subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingItemRight}>
        {item.action === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={() => {
              if (item.onPress) {
                item.onPress();
              }
            }}
            trackColor={{ false: theme.border, true: theme.primary + '80' }}
            thumbColor={item.value ? theme.primary : theme.card}
          />
        ) : item.action === 'navigate' ? (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.secondaryText}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
  
  // Render a settings section
  const renderSection = (title: string, items: SettingItem[]) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={500} 
      delay={200}
      useNativeDriver
      style={styles.section}
    >
      <Text variant="subtitle1" weight="semibold" style={styles.sectionTitle}>
        {title}
      </Text>
      <Card style={styles.sectionCard}>
        {items.map(renderSettingItem)}
      </Card>
    </Animatable.View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h3" weight="semibold">Settings</Text>
        </View>
        
        <Animatable.View 
          animation="fadeIn" 
          duration={800}
          useNativeDriver
          style={styles.profileCard}
        >
          <TouchableOpacity 
            style={styles.profileInfo}
            onPress={() => router.push('/settings/profile')}
          >
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <MaterialCommunityIcons name="account" size={32} color="#fff" />
            </View>
            <View style={styles.profileText}>
              <Text variant="h4" weight="semibold">{user?.username || 'User'}</Text>
              <Text variant="body2" color="secondaryText">{user?.email || 'user@example.com'}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.secondaryText}
            />
          </TouchableOpacity>
        </Animatable.View>

        {renderSection('Profile', profileSettings)}
        {renderSection('Security', securitySettings)}
        {renderSection('App Settings', appSettings)}
        {renderSection('Account', accountSettings)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  settingItemRight: {
    marginLeft: spacing.md,
  },
  profileCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    marginLeft: spacing.md,
    flex: 1,
  },
}); 