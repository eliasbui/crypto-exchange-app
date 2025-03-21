import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Animatable from 'react-native-animatable';
import { useUIStore } from '../store/uiStore';
import { useNotificationStore, Notification } from '../store/notificationStore';
import { getTheme, spacing, radius } from '../constants/theme';
import Text from '../components/ui/Text';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function NotificationsScreen() {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    loadNotifications 
  } = useNotificationStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'trade':
        return 'swap-horizontal';
      case 'price':
        return 'chart-line';
      case 'security':
        return 'shield-alert';
      case 'transaction':
        return 'bank-transfer';
      case 'promotion':
        return 'gift';
      default:
        return 'bell';
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>,
    item: Notification
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [64, 0],
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
            backgroundColor: theme.danger,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => deleteNotification(item.id)}
          style={styles.deleteButton}
        >
          <MaterialCommunityIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
      onSwipeableOpen={() => console.log('Swipeable opened')}
    >
      <TouchableOpacity
        onPress={() => !item.isRead && markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <Card
          style={[
            styles.notificationCard,
            !item.isRead && { backgroundColor: theme.primary + '10' },
          ]}
        >
          <View style={styles.notificationContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.primary + '20' },
              ]}
            >
              <MaterialCommunityIcons
                name={getNotificationIcon(item.type)}
                size={24}
                color={theme.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text variant="subtitle1" weight="semibold">
                {item.title}
              </Text>
              <Text variant="body2" color="secondaryText" style={styles.message}>
                {item.message}
              </Text>
              <Text variant="caption" color="secondaryText">
                {formatDate(item.timestamp)}
              </Text>
            </View>
            {!item.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
            )}
          </View>
        </Card>
      </TouchableOpacity>
    </Swipeable>
  );

  const renderEmptyState = () => (
    <Animatable.View
      animation="fadeIn"
      duration={300}
      style={styles.emptyState}
      useNativeDriver
    >
      <MaterialCommunityIcons
        name="bell-off-outline"
        size={64}
        color={theme.secondaryText}
      />
      <Text
        variant="subtitle1"
        color="secondaryText"
        align="center"
        style={styles.emptyStateTitle}
      >
        No notifications yet
      </Text>
      <Text variant="body2" color="secondaryText" align="center">
        We'll notify you when something important happens
      </Text>
    </Animatable.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text variant="h4" weight="semibold">
          Notifications
        </Text>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            onPress={markAllAsRead}
            disabled={unreadCount === 0}
            style={styles.markAllButton}
            title="Mark all as read"
          />
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
  },
  markAllButton: {
    marginLeft: spacing.md,
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
  },
  notificationCard: {
    marginBottom: spacing.sm,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  message: {
    marginVertical: spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  deleteAction: {
    marginBottom: spacing.sm,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteButton: {
    width: 64,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
}); 