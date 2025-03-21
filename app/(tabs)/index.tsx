import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { getTheme, spacing } from '../../constants/theme';
import { useCryptoStore } from '../../store/cryptoStore';
import { useAuthStore } from '../../store/authStore';
import Text from '../../components/ui/Text';
import PortfolioSummary from '../../components/PortfolioSummary';
import CryptoCard from '../../components/CryptoCard';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  const router = useRouter();
  
  const { user } = useAuthStore();
  const { trendingCoins, portfolio, fetchTrendingCoins, fetchPortfolio } = useCryptoStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchTrendingCoins();
    fetchPortfolio();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchTrendingCoins(), fetchPortfolio()]);
    setRefreshing(false);
  }, [fetchTrendingCoins, fetchPortfolio]);

  const navigateToCoinDetails = (coinId: string) => {
    // This would normally navigate to a coin detail screen
    console.log(`Navigate to coin: ${coinId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text variant="body2" color="secondaryText">Welcome back,</Text>
            <Text variant="h3" weight="semibold">{user?.username || 'Trader'}</Text>
          </View>
        </View>

        <PortfolioSummary portfolio={portfolio} />

        <Animatable.View animation="fadeInUp" duration={800} delay={400} useNativeDriver>
          <View style={styles.sectionHeader}>
            <Text variant="h4">Trending Coins</Text>
            <Text variant="body2" color="primary" onPress={() => router.push('/market')}>
              See All
            </Text>
          </View>

          {trendingCoins.map((coin) => (
            <CryptoCard
              key={coin.id}
              crypto={coin}
              onPress={() => navigateToCoinDetails(coin.id)}
            />
          ))}
        </Animatable.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
});
