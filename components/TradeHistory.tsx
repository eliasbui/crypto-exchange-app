import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useUIStore } from '../store/uiStore';
import { getTheme, spacing, radius } from '../constants/theme';
import Text from './ui/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface TradeHistoryProps {
  trades: Trade[];
  onDelete?: (id: string) => void;
  onEdit?: (trade: Trade) => void;
}

const TradeHistory: React.FC<TradeHistoryProps> = ({
  trades,
  onDelete,
  onEdit,
}) => {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderRightActions = (trade: Trade) => {
    if (!onDelete && !onEdit) return null;

    return (
      <View style={styles.actionButtons}>
        {onEdit && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => onEdit(trade)}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.danger }]}
            onPress={() => onDelete(trade.id)}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTradeItem = (trade: Trade) => {
    const isBuy = trade.type === 'buy';
    const statusColor = 
      trade.status === 'completed' ? theme.success :
      trade.status === 'failed' ? theme.danger :
      theme.warning;

    return (
      <Swipeable renderRightActions={() => renderRightActions(trade)}>
        <Animatable.View
          animation="fadeIn"
          duration={300}
          style={[styles.tradeItem, { backgroundColor: theme.card }]}
        >
          <View style={styles.tradeHeader}>
            <View style={styles.tradeType}>
              <MaterialCommunityIcons
                name={isBuy ? 'arrow-bottom-right' : 'arrow-top-right'}
                size={20}
                color={isBuy ? theme.success : theme.danger}
              />
              <Text
                variant="subtitle2"
                weight="semibold"
                style={{ color: isBuy ? theme.success : theme.danger }}
              >
                {isBuy ? 'Buy' : 'Sell'}
              </Text>
            </View>
            <Text variant="caption" color="secondaryText">
              {formatTime(trade.timestamp)}
            </Text>
          </View>

          <View style={styles.tradeDetails}>
            <View style={styles.detailRow}>
              <Text variant="body2" color="secondaryText">Price</Text>
              <Text variant="body2" weight="semibold">
                ${trade.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text variant="body2" color="secondaryText">Amount</Text>
              <Text variant="body2" weight="semibold">
                {trade.amount.toLocaleString(undefined, { minimumFractionDigits: 6 })} BTC
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text variant="body2" color="secondaryText">Total</Text>
              <Text variant="body2" weight="semibold">
                ${trade.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text variant="caption" style={{ color: statusColor }}>
              {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
            </Text>
          </View>
        </Animatable.View>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      {trades.map((trade) => (
        <View key={trade.id} style={styles.tradeContainer}>
          {renderTradeItem(trade)}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tradeContainer: {
    marginBottom: spacing.sm,
  },
  tradeItem: {
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tradeType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tradeDetails: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TradeHistory; 