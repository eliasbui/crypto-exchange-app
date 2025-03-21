import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Portfolio } from '../types';
import Card from './ui/Card';
import Text from './ui/Text';
import { formatCurrency, formatPercentage } from '../utils/helpers';
import { spacing } from '../constants/theme';
import { useUIStore } from '../store/uiStore';
import { getTheme } from '../constants/theme';
import { LineChart } from 'react-native-chart-kit';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolio }) => {
  const theme = getTheme(useUIStore((state) => state.theme));
  const isPositive = portfolio.percentageChange24h >= 0;
  const screenWidth = Dimensions.get('window').width - 32; // Padding on both sides

  // Generate mock data for the chart
  const mockChartData = React.useMemo(() => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      // Start with 90% of current balance and gradually increase to current balance
      const factor = 0.9 + (i * 0.1 / 6);
      data.push(portfolio.totalBalance * factor);
    }
    return data;
  }, [portfolio.totalBalance]);

  const chartConfig = {
    backgroundGradientFrom: theme.primary,
    backgroundGradientTo: theme.primary,
    color: () => 'rgba(255, 255, 255, 0.8)',
    strokeWidth: 2,
    fillShadowGradient: 'rgba(255, 255, 255, 0.6)',
    fillShadowGradientOpacity: 0.3,
    decimalPlaces: 2,
    linejoinType: 'round' as 'round',
    propsForDots: {
      r: '0',
      strokeWidth: '0',
    },
  };

  return (
    <Animatable.View 
      animation="fadeInUp" 
      duration={800} 
      useNativeDriver
    >
      <Card 
        style={[styles.container, { backgroundColor: theme.primary }]}
        borderRadius="lg"
        elevation="md"
        padding="lg"
      >
        <Text variant="body2" style={styles.label}>Total Balance</Text>
        <Text variant="h2" style={styles.balance}>{formatCurrency(portfolio.totalBalance)}</Text>
        
        <View style={styles.profitContainer}>
          <Text variant="body2" style={styles.label}>24h Change</Text>
          <View style={styles.profitRow}>
            <Text 
              variant="subtitle2" 
              style={[
                styles.profitAmount, 
                { color: isPositive ? theme.positive : theme.negative }
              ]}
            >
              {isPositive ? '+' : ''}{formatCurrency(portfolio.profitLoss24h)}
            </Text>
            <View style={[
              styles.percentageContainer,
              { backgroundColor: isPositive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)' }
            ]}>
              <Text 
                variant="caption" 
                style={[
                  styles.percentageText,
                  { color: isPositive ? theme.positive : theme.negative }
                ]}
              >
                {formatPercentage(portfolio.percentageChange24h)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{ data: mockChartData }],
            }}
            width={screenWidth}
            height={180}
            chartConfig={chartConfig}
            bezier
            withHorizontalLines={false}
            withVerticalLines={false}
            withDots={false}
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            withShadow={false}
            transparent
          />
        </View>
      </Card>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing.xs,
  },
  balance: {
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  profitContainer: {
    marginBottom: spacing.lg,
  },
  profitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profitAmount: {
    marginRight: spacing.sm,
  },
  percentageContainer: {
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  percentageText: {
    fontWeight: '600',
  },
  chartContainer: {
    marginTop: spacing.md,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
});

export default PortfolioSummary; 