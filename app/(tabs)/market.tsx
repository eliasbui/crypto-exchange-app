import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, RefreshControl, TouchableOpacity } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import { useCryptoStore } from '../../store/cryptoStore';
import Text from '../../components/ui/Text';
import CryptoCard from '../../components/CryptoCard';
import { Cryptocurrency } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { StatusBar } from 'expo-status-bar';

type SortOption = 'name' | 'price' | 'change';
type SortDirection = 'asc' | 'desc';

export default function MarketScreen() {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  const { allCoins, fetchAllCoins } = useCryptoStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Fetch coins on mount
  useEffect(() => {
    fetchAllCoins();
  }, []);
  
  // Filter and sort coins
  const filteredCoins = React.useMemo(() => {
    let result = [...allCoins];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        coin => 
          coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortDirection === 'asc' 
          ? a.price - b.price 
          : b.price - a.price;
      } else {
        // Sort by change
        return sortDirection === 'asc' 
          ? a.change24h - b.change24h 
          : b.change24h - a.change24h;
      }
    });
    
    return result;
  }, [allCoins, searchQuery, sortBy, sortDirection]);
  
  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchAllCoins();
    setRefreshing(false);
  }, [fetchAllCoins]);
  
  // Toggle sort direction or change sort field
  const handleSort = (field: SortOption) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and reset direction to ascending
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Render header with search and sort options
  const renderHeader = () => (
    <Animatable.View animation="fadeInDown" duration={500} useNativeDriver>
      <View style={styles.header}>
        <Text variant="h3" weight="semibold">Market</Text>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <MaterialCommunityIcons name="magnify" size={24} color={theme.secondaryText} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search coins..."
          placeholderTextColor={theme.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close" size={20} color={theme.secondaryText} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <View style={styles.sortContainer}>
        <Text variant="body2" color="secondaryText">Sort by:</Text>
        <View style={styles.sortOptions}>
          <TouchableOpacity 
            style={[
              styles.sortOption, 
              sortBy === 'name' && { backgroundColor: theme.primary + '20' }
            ]}
            onPress={() => handleSort('name')}
          >
            <Text 
              variant="body2" 
              color={sortBy === 'name' ? 'primary' : 'secondaryText'}
            >
              Name
              {sortBy === 'name' && (
                <MaterialCommunityIcons 
                  name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
                  size={14} 
                />
              )}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.sortOption, 
              sortBy === 'price' && { backgroundColor: theme.primary + '20' }
            ]}
            onPress={() => handleSort('price')}
          >
            <Text 
              variant="body2" 
              color={sortBy === 'price' ? 'primary' : 'secondaryText'}
            >
              Price
              {sortBy === 'price' && (
                <MaterialCommunityIcons 
                  name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
                  size={14} 
                />
              )}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.sortOption, 
              sortBy === 'change' && { backgroundColor: theme.primary + '20' }
            ]}
            onPress={() => handleSort('change')}
          >
            <Text 
              variant="body2" 
              color={sortBy === 'change' ? 'primary' : 'secondaryText'}
            >
              Change
              {sortBy === 'change' && (
                <MaterialCommunityIcons 
                  name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
                  size={14} 
                />
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );
  
  const renderCryptoItem = ({ item }: { item: Cryptocurrency }) => (
    <Animatable.View animation="fadeIn" duration={500} useNativeDriver>
      <CryptoCard 
        crypto={item} 
        onPress={() => console.log(`Navigate to coin: ${item.id}`)}
        showChart={false}
      />
    </Animatable.View>
  );
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="currency-btc" size={64} color={theme.secondaryText} />
      <Text variant="subtitle1" color="secondaryText" style={styles.emptyText}>
        No coins found
      </Text>
      <Text variant="body2" color="secondaryText" align="center">
        Try adjusting your search or pull down to refresh
      </Text>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
      
      <FlatList
        data={filteredCoins}
        renderItem={renderCryptoItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sortOptions: {
    flexDirection: 'row',
    marginLeft: spacing.md,
  },
  sortOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginRight: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
}); 