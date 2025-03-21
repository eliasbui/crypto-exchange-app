import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useUIStore } from '../../store/uiStore';
import { useWalletStore } from '../../store/walletStore';
import { useCryptoStore } from '../../store/cryptoStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Transaction, PortfolioAsset } from '../../types';

type WalletTab = 'portfolio' | 'transactions';

export default function WalletScreen() {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  const { balance, holdings, transactions } = useWalletStore();
  const { getCoinById } = useCryptoStore();
  
  const [activeTab, setActiveTab] = useState<WalletTab>('portfolio');
  
  // Calculate total portfolio value (balance + holdings)
  const totalPortfolioValue = React.useMemo(() => {
    const holdingsValue = holdings.reduce((total, holding) => {
      const coin = getCoinById(holding.coinId);
      return total + (coin ? holding.amount * coin.price : 0);
    }, 0);
    
    return balance + holdingsValue;
  }, [balance, holdings, getCoinById]);
  
  // Format currency with commas and 2 decimal places
  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatAmount = (value: number) => {
    return value.toLocaleString(undefined, { 
      minimumFractionDigits: 6, 
      maximumFractionDigits: 6 
    });
  };
  
  // Render portfolio section with holdings
  const renderPortfolio = () => (
    <Animatable.View animation="fadeIn" duration={300} useNativeDriver>
      <View style={styles.portfolioHeader}>
        <Text variant="h4" weight="semibold">Your Assets</Text>
      </View>
      
      <Card style={styles.balanceCard}>
        <Text variant="body2" color="secondaryText">Total Balance</Text>
        <Text variant="h3" weight="bold" style={styles.balanceValue}>
          ${formatCurrency(totalPortfolioValue)}
        </Text>
        
        <View style={styles.balanceDetails}>
          <View style={styles.balanceDetailItem}>
            <Text variant="body2" color="secondaryText">Available Cash</Text>
            <Text variant="subtitle1" weight="semibold">${formatCurrency(balance)}</Text>
          </View>
          
          <View style={styles.balanceDetailItem}>
            <Text variant="body2" color="secondaryText">Invested</Text>
            <Text variant="subtitle1" weight="semibold">
              ${formatCurrency(totalPortfolioValue - balance)}
            </Text>
          </View>
        </View>
      </Card>
      
      <View style={styles.holdingsHeader}>
        <Text variant="subtitle1" weight="semibold">Your Holdings</Text>
      </View>
      
      {holdings.length === 0 ? (
        <Card style={styles.emptyStateCard}>
          <MaterialCommunityIcons 
            name="wallet-outline" 
            size={48} 
            color={theme.secondaryText} 
          />
          <Text 
            variant="subtitle1" 
            color="secondaryText" 
            align="center" 
            style={styles.emptyStateText}
          >
            No holdings yet
          </Text>
          <Text 
            variant="body2" 
            color="secondaryText" 
            align="center"
          >
            Start trading to build your portfolio
          </Text>
        </Card>
      ) : (
        holdings.map((holding) => {
          const coin = getCoinById(holding.coinId);
          if (!coin) return null;
          
          const holdingValue = holding.amount * coin.price;
          const percentOfPortfolio = (holdingValue / totalPortfolioValue) * 100;
          
          return (
            <Card key={holding.coinId} style={styles.holdingCard}>
              <View style={styles.holdingCardHeader}>
                <View style={styles.holdingCoinInfo}>
                  <MaterialCommunityIcons 
                    name="currency-btc" 
                    size={32} 
                    color={theme.primary} 
                  />
                  <View style={styles.holdingCoinDetails}>
                    <Text variant="subtitle1" weight="semibold">{coin.name}</Text>
                    <Text variant="body2" color="secondaryText">{coin.symbol}</Text>
                  </View>
                </View>
                <View style={styles.holdingValueInfo}>
                  <Text variant="subtitle1" weight="semibold">${formatCurrency(holdingValue)}</Text>
                  <Text 
                    variant="body2" 
                    color={coin.change24h >= 0 ? 'success' : 'warning'}
                  >
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </Text>
                </View>
              </View>
              
              <View style={styles.holdingCardBody}>
                <View style={styles.holdingDetail}>
                  <Text variant="body2" color="secondaryText">Amount</Text>
                  <Text variant="body2">
                    {holding.amount.toLocaleString(undefined, { 
                      minimumFractionDigits: 6, 
                      maximumFractionDigits: 6 
                    })} {coin.symbol}
                  </Text>
                </View>
                
                <View style={styles.holdingDetail}>
                  <Text variant="body2" color="secondaryText">Price</Text>
                  <Text variant="body2">${formatCurrency(coin.price)}</Text>
                </View>
                
                <View style={styles.holdingDetail}>
                  <Text variant="body2" color="secondaryText">Portfolio %</Text>
                  <Text variant="body2">{percentOfPortfolio.toFixed(2)}%</Text>
                </View>
              </View>
            </Card>
          );
        })
      )}
    </Animatable.View>
  );
  
  // Render transactions history
  const renderTransactions = () => (
    <Animatable.View animation="fadeIn" duration={300} useNativeDriver>
      <View style={styles.transactionsHeader}>
        <Text variant="h4" weight="semibold">Transaction History</Text>
      </View>
      
      {transactions.length === 0 ? (
        <Card style={styles.emptyStateCard}>
          <MaterialCommunityIcons 
            name="history" 
            size={48} 
            color={theme.secondaryText} 
          />
          <Text 
            variant="subtitle1" 
            color="secondaryText" 
            align="center" 
            style={styles.emptyStateText}
          >
            No transactions yet
          </Text>
          <Text 
            variant="body2" 
            color="secondaryText" 
            align="center"
          >
            Your trading history will appear here
          </Text>
        </Card>
      ) : (
        transactions.map((transaction, index) => {
          const { coinId, amount, type, timestamp } = transaction;
          const coin = getCoinById(coinId);
          if (!coin) return null;
          
          const isPositive = type === 'sell';
          const transactionValue = amount * coin.price;
          
          return (
            <Card key={index} style={styles.transactionCard}>
              <View style={styles.transactionCardHeader}>
                <View style={styles.transactionInfo}>
                  <View style={[
                    styles.transactionTypeIcon, 
                    { 
                      backgroundColor: isPositive 
                        ? theme.success + '20' 
                        : theme.danger + '20' 
                    }
                  ]}>
                    <MaterialCommunityIcons 
                      name={isPositive ? 'arrow-up' : 'arrow-down'} 
                      size={16} 
                      color={isPositive ? theme.success : theme.danger} 
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text variant="subtitle2" weight="semibold">
                      {type === 'buy' ? 'Bought' : 'Sold'} {coin.symbol}
                    </Text>
                    <Text variant="body2" color="secondaryText">
                      {formatDate(new Date(timestamp))}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionValueInfo}>
                  <Text 
                    variant="subtitle2" 
                    weight="semibold"
                    color={isPositive ? 'success' : 'text'}
                  >
                    {isPositive ? '+' : '-'}${formatCurrency(transactionValue)}
                  </Text>
                  <Text 
                    variant="body2" 
                    color={isPositive ? 'success' : 'danger'}
                    style={styles.transactionAmount}
                  >
                    {formatAmount(amount)} {coin.symbol}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.statusIndicator, 
                { backgroundColor: transaction.status === 'completed' ? theme.success : theme.danger }
              ]}>
                <Text variant="caption" color={transaction.status === 'completed' ? 'success' : 'danger'}>
                  {transaction.status.toUpperCase()}
                </Text>
              </View>
            </Card>
          );
        })
      )}
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
          <Text variant="h3" weight="semibold">Wallet</Text>
        </View>
        
        <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'portfolio' && { 
                backgroundColor: theme.primary + '20', 
                borderBottomColor: theme.primary 
              }
            ]}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text 
              variant="subtitle2" 
              weight="semibold"
              color={activeTab === 'portfolio' ? 'primary' : 'secondaryText'}
            >
              Portfolio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'transactions' && { 
                backgroundColor: theme.primary + '20', 
                borderBottomColor: theme.primary 
              }
            ]}
            onPress={() => setActiveTab('transactions')}
          >
            <Text 
              variant="subtitle2" 
              weight="semibold"
              color={activeTab === 'transactions' ? 'primary' : 'secondaryText'}
            >
              Transactions
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'portfolio' ? renderPortfolio() : renderTransactions()}
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
    padding: spacing.md,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  portfolioHeader: {
    marginBottom: spacing.md,
  },
  balanceCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  balanceValue: {
    marginVertical: spacing.sm,
  },
  balanceDetails: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  balanceDetailItem: {
    flex: 1,
  },
  holdingsHeader: {
    marginBottom: spacing.sm,
  },
  holdingCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  holdingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  holdingCoinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holdingCoinDetails: {
    marginLeft: spacing.sm,
  },
  holdingValueInfo: {
    alignItems: 'flex-end',
  },
  holdingCardBody: {
    marginTop: spacing.sm,
  },
  holdingDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  transactionsHeader: {
    marginBottom: spacing.md,
  },
  transactionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  transactionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  transactionDetails: {
  },
  transactionValueInfo: {
    alignItems: 'flex-end',
  },
  emptyStateCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  transactionAmount: {
    // Add appropriate styles for the transaction amount
  },
  statusIndicator: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
}); 