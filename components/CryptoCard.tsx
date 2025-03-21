import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Cryptocurrency } from '../types';
import Card from './ui/Card';
import Text from './ui/Text';
import { formatCurrency, formatPercentage } from '../utils/helpers';
import { LineChart } from 'react-native-chart-kit';
import { spacing } from '../constants/theme';
import { useUIStore } from '../store/uiStore';
import { getTheme } from '../constants/theme';

interface CryptoCardProps {
  crypto: Cryptocurrency;
  onPress?: () => void;
  showChart?: boolean;
}

const CryptoCard: React.FC<CryptoCardProps> = ({
  crypto,
  onPress,
  showChart = true,
}) => {
  const theme = getTheme(useUIStore((state) => state.theme));
  const isPositive = crypto.change24h >= 0;

  // Animation ref for the price change
  const priceRef = React.useRef<Animatable.View>(null);
  
  // Trigger pulse animation on price change
  React.useEffect(() => {
    if (priceRef.current) {
      priceRef.current.pulse?.(500);
    }
  }, [crypto.price]);

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: () => isPositive ? theme.positive : theme.negative,
    strokeWidth: 2,
    fillShadowGradient: isPositive ? theme.positive : theme.negative,
    fillShadowGradientOpacity: 0.3,
    decimalPlaces: 2,
    linejoinType: 'round' as 'round',
    propsForDots: {
      r: '0',
      strokeWidth: '0',
    },
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7} 
      disabled={!onPress}
    >
      <Card style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <Image 
              source={{ uri: crypto.logoUrl }} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <View style={styles.nameContainer}>
              <Text variant="subtitle2">{crypto.name}</Text>
              <Text variant="body2" color="secondaryText">{crypto.symbol}</Text>
            </View>
          </View>
          
          <Animatable.View ref={priceRef} style={styles.priceContainer}>
            <Text variant="subtitle1" weight="semibold">
              {formatCurrency(crypto.price)}
            </Text>
            <View style={[
              styles.changeContainer, 
              { backgroundColor: isPositive ? theme.positive + '20' : theme.negative + '20' }
            ]}>
              <Text 
                variant="caption" 
                style={{ color: isPositive ? theme.positive : theme.negative }}
              >
                {formatPercentage(crypto.change24h)}
              </Text>
            </View>
          </Animatable.View>
        </View>
        
        {showChart && crypto.sparklineData && (
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: [],
                datasets: [{ data: crypto.sparklineData }],
              }}
              width={280}
              height={100}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withHorizontalLabels={false}
              withVerticalLabels={false}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameContainer: {
    marginLeft: spacing.sm,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  changeContainer: {
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    marginTop: 2,
  },
  chartContainer: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 4,
  },
});

export default CryptoCard; 