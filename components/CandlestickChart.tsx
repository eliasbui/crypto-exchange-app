import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useUIStore } from '../store/uiStore';
import { getTheme } from '../constants/theme';

interface CandleData {
  x: Date;
  open: number;
  close: number;
  high: number;
  low: number;
}

interface CandlestickChartProps {
  data: CandleData[];
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);

  // Convert candlestick data to line chart data
  const chartData = {
    labels: data.map((_, i) => ''),
    datasets: [
      {
        data: data.map(candle => candle.close),
        color: (opacity = 1) => theme.primary,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: theme.card,
          backgroundGradientFrom: theme.card,
          backgroundGradientTo: theme.card,
          decimalPlaces: 2,
          color: (opacity = 1) => theme.text,
          labelColor: (opacity = 1) => theme.secondaryText,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '0',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withDots={false}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLabels={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});

export default CandlestickChart; 