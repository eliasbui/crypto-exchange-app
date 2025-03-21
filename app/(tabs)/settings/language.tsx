import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../../../store/uiStore';
import { getTheme, spacing } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import { router } from 'expo-router';

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

export default function LanguageScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));
  // In a real app, this would come from a language store
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
    // In a real app, this would update the app's language
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
          Language
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Choose your preferred language
        </Text>
      </View>

      <Card style={styles.languagesCard}>
        {languages.map((language, index) => (
          <React.Fragment key={language.code}>
            <TouchableOpacity
              style={styles.languageItem}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <View style={styles.languageInfo}>
                <Text variant="body1" weight="semibold">
                  {language.name}
                </Text>
                <Text variant="body2" color="secondaryText">
                  {language.nativeName}
                </Text>
              </View>
              {selectedLanguage === language.code && (
                <MaterialCommunityIcons 
                  name="check" 
                  size={24} 
                  color={theme.primary} 
                />
              )}
            </TouchableOpacity>
            {index < languages.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            )}
          </React.Fragment>
        ))}
      </Card>

      <Text variant="caption" color="secondaryText" style={styles.disclaimer}>
        Changing the language will affect all text in the app. Some content from external sources may still appear in their original language.
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
  languagesCard: {
    marginHorizontal: spacing.md,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  languageInfo: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  disclaimer: {
    margin: spacing.lg,
    textAlign: 'center',
  },
}); 