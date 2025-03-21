import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useUIStore } from '../../store/uiStore';
import { useCryptoStore } from '../../store/cryptoStore';
import { useWalletStore } from '../../store/walletStore';
import { getTheme, spacing } from '../../constants/theme';
import Text from '../../components/ui/Text';
import CandlestickChart from '../../components/CandlestickChart';
import OrderBook from '../../components/OrderBook';
import TradeForm from '../../components/TradeForm';
import TradeHistory from '../../components/TradeHistory';
import * as Animatable from 'react-native-animatable';

// Mock data for candlestick chart
const generateMockCandleData = (days: number) => {
  const data = [];
  let price = 45000;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const open = price + (Math.random() - 0.5) * 1000;
    const close = open + (Math.random() - 0.5) * 1000;
    const high = Math.max(open, close) + Math.random() * 500;
    const low = Math.min(open, close) - Math.random() * 500;
    
    data.push({
      x: date,
      open,
      close,
      high,
      low,
    });
    
    price = close;
  }
  
  return data;
};

// Mock data for order book
const generateMockOrders = (basePrice: number, count: number) => {
  const orders = [];
  let price = basePrice;
  
  for (let i = 0; i < count; i++) {
    const quantity = Math.random() * 2;
    orders.push({
      price,
      quantity,
      total: price * quantity,
    });
    price += (Math.random() - 0.5) * 100;
  }
  
  return orders.sort((a, b) => b.price - a.price);
};

export default function TradeScreen() {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  const { allCoins } = useCryptoStore();
  const { balance, holdings } = useWalletStore();
  
  const [selectedCoin] = useState(allCoins[0]);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [candleData] = useState(() => generateMockCandleData(30));
  const [buyOrders] = useState(() => generateMockOrders(45000, 10));
  const [sellOrders] = useState(() => generateMockOrders(45000, 10));
  const [trades] = useState(() => [
    {
      id: '1',
      type: 'buy' as const,
      price: 45000,
      amount: 0.1,
      total: 4500,
      timestamp: new Date(),
      status: 'completed' as const,
    },
    {
      id: '2',
      type: 'sell' as const,
      price: 44800,
      amount: 0.05,
      total: 2240,
      timestamp: new Date(Date.now() - 3600000),
      status: 'completed' as const,
    },
  ]);

  const handleOrderSubmit = (order: any) => {
    console.log('Order submitted:', order);
    // Implement order submission logic
  };

  const handleOrderSelect = (price: number) => {
    console.log('Order selected:', price);
    // Implement order selection logic
  };

  const handleTradeDelete = (id: string) => {
    console.log('Delete trade:', id);
    // Implement trade deletion logic
  };

  const handleTradeEdit = (trade: any) => {
    console.log('Edit trade:', trade);
    // Implement trade editing logic
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView style={styles.content}>
        <Animatable.View animation="fadeIn" duration={500} useNativeDriver>
          <View style={styles.header}>
            <Text variant="h4" weight="semibold">
              {selectedCoin?.symbol}/USDT
            </Text>
            <Text 
              variant="h3" 
              weight="bold"
              style={{ color: selectedCoin?.change24h >= 0 ? theme.success : theme.danger }}
            >
              ${selectedCoin?.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
            <Text 
              variant="body2"
              style={{ color: selectedCoin?.change24h >= 0 ? theme.success : theme.danger }}
            >
              {selectedCoin?.change24h >= 0 ? '+' : ''}{selectedCoin?.change24h.toFixed(2)}%
            </Text>
          </View>

          <View style={styles.chartContainer}>
            <CandlestickChart data={candleData} />
          </View>

          <View style={styles.orderBookContainer}>
            <Text variant="subtitle1" weight="semibold" style={styles.sectionTitle}>
              Order Book
            </Text>
            <OrderBook
              buyOrders={buyOrders}
              sellOrders={sellOrders}
              lastPrice={selectedCoin?.price || 0}
              onOrderSelect={handleOrderSelect}
            />
          </View>

          <View style={styles.tradeFormContainer}>
            <TradeForm
              type={tradeType}
              maxAmount={tradeType === 'buy' ? balance : (holdings.find(h => h.coinId === selectedCoin?.id)?.amount || 0)}
              currentPrice={selectedCoin?.price || 0}
              onSubmit={handleOrderSubmit}
            />
          </View>

          <View style={styles.tradeHistoryContainer}>
            <Text variant="subtitle1" weight="semibold" style={styles.sectionTitle}>
              Trade History
            </Text>
            <TradeHistory
              trades={trades}
              onDelete={handleTradeDelete}
              onEdit={handleTradeEdit}
            />
          </View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: spacing.xxxl,
  },
  header: {
    padding: spacing.md,
    alignItems: 'center',
  },
  chartContainer: {
    marginVertical: spacing.md,
  },
  orderBookContainer: {
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tradeFormContainer: {
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tradeHistoryContainer: {
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
}); 