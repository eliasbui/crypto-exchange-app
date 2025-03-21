import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useUIStore } from '../store/uiStore';
import { getTheme, spacing, radius } from '../constants/theme';
import Text from './ui/Text';

interface Order {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookProps {
  buyOrders: Order[];
  sellOrders: Order[];
  lastPrice: number;
  onOrderSelect?: (price: number) => void;
}

const OrderBook: React.FC<OrderBookProps> = ({
  buyOrders,
  sellOrders,
  lastPrice,
  onOrderSelect,
}) => {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  
  // Animation value for new orders
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animate new orders
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [buyOrders, sellOrders]);

  const renderOrderRow = (order: Order, type: 'buy' | 'sell') => {
    const total = order.price * order.quantity;
    const color = type === 'buy' ? theme.success : theme.danger;
    
    return (
      <Animated.View
        style={[
          styles.orderRow,
          {
            backgroundColor: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [theme.card, `${color}20`],
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.orderRowContent}
          onPress={() => onOrderSelect?.(order.price)}
        >
          <Text variant="body2" style={{ color }}>
            ${order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <Text variant="body2" color="secondaryText">
            {order.quantity.toLocaleString(undefined, { minimumFractionDigits: 6 })}
          </Text>
          <Text variant="body2" color="secondaryText">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text variant="body2" color="secondaryText" style={styles.headerCell}>Price</Text>
        <Text variant="body2" color="secondaryText" style={styles.headerCell}>Amount</Text>
        <Text variant="body2" color="secondaryText" style={styles.headerCell}>Total</Text>
      </View>
      
      <ScrollView style={styles.sellOrders}>
        {sellOrders.map((order, index) => (
          <View key={`sell-${index}`}>
            {renderOrderRow(order, 'sell')}
          </View>
        ))}
      </ScrollView>
      
      <View style={[styles.lastPrice, { borderColor: theme.border }]}>
        <Text variant="subtitle2" weight="semibold" style={{ color: theme.primary }}>
          ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      </View>
      
      <ScrollView style={styles.buyOrders}>
        {buyOrders.map((order, index) => (
          <View key={`buy-${index}`}>
            {renderOrderRow(order, 'buy')}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  headerCell: {
    flex: 1,
    textAlign: 'right',
  },
  sellOrders: {
    flex: 1,
  },
  buyOrders: {
    flex: 1,
  },
  orderRow: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  orderRowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lastPrice: {
    padding: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
});

export default OrderBook; 