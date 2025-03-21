import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Animatable from 'react-native-animatable';
import { Transaction } from '../types';
import Text from './ui/Text';
import { formatCurrency, formatDate, formatTime } from '../utils/helpers';
import { spacing } from '../constants/theme';
import { useUIStore } from '../store/uiStore';
import { getTheme } from '../constants/theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  onDelete?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onDelete,
}) => {
  const theme = getTheme(useUIStore((state) => state.theme));
  const isBuy = transaction.type === 'buy';
  
  // Render right actions for swipeable
  const renderRightActions = () => {
    if (!onDelete) return null;
    
    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: theme.danger }]}
        onPress={onDelete}
      >
        <Icon name="delete" size={24} color="#fff" />
      </TouchableOpacity>
    );
  };
  
  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Animatable.View
        animation="fadeIn"
        duration={500}
        useNativeDriver
      >
        <TouchableOpacity
          style={[styles.container, { backgroundColor: theme.card }]}
          onPress={onPress}
          disabled={!onPress}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <View style={[
              styles.iconBackground,
              { backgroundColor: isBuy ? theme.positive + '20' : theme.negative + '20' }
            ]}>
              <Icon
                name={isBuy ? 'arrow-bottom-left' : 'arrow-top-right'}
                size={20}
                color={isBuy ? theme.positive : theme.negative}
              />
            </View>
          </View>
          
          <View style={styles.contentContainer}>
            <View style={styles.row}>
              <Text variant="subtitle2">
                {isBuy ? 'Bought' : 'Sold'} {transaction.coinSymbol}
              </Text>
              <Text variant="subtitle2" weight="semibold">
                {formatCurrency(transaction.total)}
              </Text>
            </View>
            
            <View style={styles.row}>
              <Text variant="body2" color="secondaryText">
                {formatDate(transaction.timestamp)} at {formatTime(transaction.timestamp)}
              </Text>
              <Text variant="body2" weight="medium" style={{ color: isBuy ? theme.positive : theme.negative }}>
                {isBuy ? '+' : '-'}{transaction.amount} {transaction.coinSymbol}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 12,
  },
  iconContainer: {
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
});

export default TransactionItem; 