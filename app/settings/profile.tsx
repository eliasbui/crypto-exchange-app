import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';

import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface UserProfile {
  avatar: string | null;
  username: string;
  email: string;
  phone: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  const { user } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    avatar: null,
    username: user?.username || '',
    email: user?.email || '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile({ ...profile, ...JSON.parse(savedProfile) });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to change your avatar.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfile({ ...profile, avatar: result.assets[0].uri });
    }
  };

  const handleChangePassword = () => {
    router.push('/settings/change-password');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text variant="h4" weight="semibold">Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
          disabled={loading}
        >
          <MaterialCommunityIcons 
            name={isEditing ? 'close' : 'pencil'} 
            size={24} 
            color={theme.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animatable.View 
          animation="fadeIn" 
          duration={600}
          useNativeDriver
        >
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={isEditing ? pickImage : undefined}
            disabled={!isEditing}
          >
            {profile.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                <MaterialCommunityIcons
                  name="account"
                  size={40}
                  color={theme.primary}
                />
              </View>
            )}
            {isEditing && (
              <View style={[styles.editOverlay, { backgroundColor: theme.primary + '80' }]}>
                <MaterialCommunityIcons name="camera" size={24} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </Animatable.View>

        <Card style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text variant="body2" color="secondaryText">Username</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: isEditing ? theme.card : 'transparent',
                }
              ]}
              value={profile.username}
              onChangeText={(text) => setProfile({ ...profile, username: text })}
              editable={isEditing}
              placeholder="Enter username"
              placeholderTextColor={theme.secondaryText}
            />
          </View>

          <View style={styles.formGroup}>
            <Text variant="body2" color="secondaryText">Email</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: isEditing ? theme.card : 'transparent',
                }
              ]}
              value={profile.email}
              onChangeText={(text) => setProfile({ ...profile, email: text })}
              editable={isEditing}
              placeholder="Enter email"
              placeholderTextColor={theme.secondaryText}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text variant="body2" color="secondaryText">Phone Number</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: isEditing ? theme.card : 'transparent',
                }
              ]}
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              editable={isEditing}
              placeholder="Enter phone number"
              placeholderTextColor={theme.secondaryText}
              keyboardType="phone-pad"
            />
          </View>
        </Card>

        <Card style={styles.securityCard}>
          <TouchableOpacity
            style={styles.securityOption}
            onPress={handleChangePassword}
          >
            <View style={styles.securityOptionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                <MaterialCommunityIcons name="lock" size={24} color={theme.primary} />
              </View>
              <View style={styles.securityOptionText}>
                <Text variant="subtitle1" weight="semibold">Change Password</Text>
                <Text variant="body2" color="secondaryText">Update your account password</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.secondaryText} />
          </TouchableOpacity>
        </Card>

        {isEditing && (
          <Animatable.View
            animation="fadeInUp"
            duration={300}
            useNativeDriver
            style={styles.buttonContainer}
          >
            <Button
              title={loading ? 'Saving...' : 'Save Changes'}
              onPress={saveProfile}
              disabled={loading}
              style={styles.saveButton}
            />
          </Animatable.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
  },
  backButton: {
    padding: spacing.xs,
  },
  editButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    fontSize: 16,
  },
  securityCard: {
    marginBottom: spacing.md,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  securityOptionLeft: {
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
  securityOptionText: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xxxl,
  },
  saveButton: {
    height: 48,
  },
}); 