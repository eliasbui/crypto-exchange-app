import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';
import { useNotificationStore, NotificationItem } from '../../services/NotificationService';
import { getTheme, spacing } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Card from '../../components/ui/Card';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));
  const { notifications, markAsRead, clearNotifications } = useNotificationStore();

  const renderNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'transaction':
        return 'cash-multiple';
      case 'security':
        return 'shield-alert';
      default:
        return 'bell';
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      onPress={() => markAsRead(item.id)}
      style={[
        styles.notificationItem,
        !item.read && { backgroundColor: theme.primary + '10' },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
        <MaterialCommunityIcons
          name={renderNotificationIcon(item.type)}
          size={24}
          color={theme.primary}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text variant="body1" weight="semibold" style={styles.title}>
          {item.title}
        </Text>
        <Text variant="body2" color="secondaryText" style={styles.body}>
          {item.body}
        </Text>
        <Text variant="caption" color="secondaryText" style={styles.timestamp}>
          {formatDistanceToNow(item.timestamp, { addSuffix: true })}
        </Text>
      </View>
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text variant="h4" weight="bold">
        Notifications
      </Text>
      {notifications.length > 0 && (
        <TouchableOpacity onPress={clearNotifications}>
          <Text variant="body2" color="primary">
            Clear All
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => (
    <Card style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="bell-off-outline"
        size={48}
        color={theme.secondaryText}
        style={styles.emptyIcon}
      />
      <Text variant="subtitle1" weight="semibold" style={styles.emptyTitle}>
        No Notifications
      </Text>
      <Text variant="body2" color="secondaryText" style={styles.emptyText}>
        You don't have any notifications at the moment.
        We'll notify you when something important happens.
      </Text>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
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
  listContent: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contentContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  body: {
    marginBottom: spacing.xs,
  },
  timestamp: {
    marginTop: spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    alignSelf: 'center',
  },
  emptyContainer: {
    margin: spacing.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
}); 