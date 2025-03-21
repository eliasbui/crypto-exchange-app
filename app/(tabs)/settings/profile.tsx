import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { getTheme, spacing, radius } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Handle profile picture selection
  const handleSelectProfilePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant access to your photo library to change profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        try {
          // In a real app, you would upload the image to a server here
          // and get back a URL to store in the user profile
          const imageUrl = result.assets[0].uri;
          await updateUser({ ...user, profilePicture: imageUrl });
          Alert.alert('Success', 'Profile picture updated successfully');
        } catch (error) {
          console.error('Error updating profile picture:', error);
          Alert.alert('Error', 'Failed to update profile picture. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error selecting profile picture:', error);
      Alert.alert('Error', 'Failed to select profile picture. Please try again.');
    }
  };

  // Handle edit field
  const handleEditField = (field: string, currentValue: string) => {
    Alert.prompt(
      `Edit ${field}`,
      `Enter new ${field.toLowerCase()}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (newValue) => {
            if (!newValue || newValue === currentValue) return;
            
            setLoading(true);
            try {
              await updateUser({ ...user, [field.toLowerCase()]: newValue });
              Alert.alert('Success', `${field} updated successfully`);
            } catch (error) {
              console.error(`Error updating ${field}:`, error);
              Alert.alert('Error', `Failed to update ${field}. Please try again.`);
            } finally {
              setLoading(false);
            }
          }
        }
      ],
      'plain-text',
      currentValue
    );
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
          Profile
        </Text>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity 
          style={styles.profilePicture}
          onPress={handleSelectProfilePicture}
          disabled={loading}
        >
          {user?.profilePicture ? (
            <Image 
              source={{ uri: user.profilePicture }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.primary }]}>
              <MaterialCommunityIcons name="account" size={40} color="#fff" />
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
            <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <Card style={styles.infoCard}>
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => handleEditField('Username', user?.username || '')}
        >
          <View style={styles.infoLeft}>
            <MaterialCommunityIcons 
              name="account" 
              size={24} 
              color={theme.primary} 
            />
            <View style={styles.infoText}>
              <Text variant="body2" color="secondaryText">Username</Text>
              <Text variant="body1">{user?.username || 'Not set'}</Text>
            </View>
          </View>
          <MaterialCommunityIcons 
            name="pencil" 
            size={20} 
            color={theme.secondaryText} 
          />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => handleEditField('Email', user?.email || '')}
        >
          <View style={styles.infoLeft}>
            <MaterialCommunityIcons 
              name="email" 
              size={24} 
              color={theme.primary} 
            />
            <View style={styles.infoText}>
              <Text variant="body2" color="secondaryText">Email</Text>
              <Text variant="body1">{user?.email || 'Not set'}</Text>
            </View>
          </View>
          <MaterialCommunityIcons 
            name="pencil" 
            size={20} 
            color={theme.secondaryText} 
          />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => handleEditField('Phone', user?.phone || '')}
        >
          <View style={styles.infoLeft}>
            <MaterialCommunityIcons 
              name="phone" 
              size={24} 
              color={theme.primary} 
            />
            <View style={styles.infoText}>
              <Text variant="body2" color="secondaryText">Phone</Text>
              <Text variant="body1">{user?.phone || 'Not set'}</Text>
            </View>
          </View>
          <MaterialCommunityIcons 
            name="pencil" 
            size={20} 
            color={theme.secondaryText} 
          />
        </TouchableOpacity>
      </Card>

      <Card style={[styles.infoCard, { marginTop: spacing.md }]}>
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => router.push('/settings/auth-settings')}
        >
          <View style={styles.infoLeft}>
            <MaterialCommunityIcons 
              name="shield-lock" 
              size={24} 
              color={theme.primary} 
            />
            <View style={styles.infoText}>
              <Text variant="body1">Security Settings</Text>
              <Text variant="body2" color="secondaryText">
                Manage your account security
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={theme.secondaryText} 
          />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => router.push('/settings/notifications')}
        >
          <View style={styles.infoLeft}>
            <MaterialCommunityIcons 
              name="bell" 
              size={24} 
              color={theme.primary} 
            />
            <View style={styles.infoText}>
              <Text variant="body1">Notification Preferences</Text>
              <Text variant="body2" color="secondaryText">
                Manage your notifications
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={theme.secondaryText} 
          />
        </TouchableOpacity>
      </Card>
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
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profilePicture: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    marginHorizontal: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
}); 