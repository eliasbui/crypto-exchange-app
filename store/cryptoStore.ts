import { create } from 'zustand';
import { CryptoState, Transaction, Cryptocurrency } from '../types';
import { cryptocurrencies, portfolio, transactions } from '../data/mockData';
import { generateId } from '../utils/helpers';

export const useCryptoStore = create<CryptoState>((set, get) => ({
  trendingCoins: [],
  allCoins: [],
  portfolio: portfolio,
  transactions: transactions,

  // Initialize data
  initialize: async () => {
    try {
      const store = get();
      await Promise.all([
        store.fetchTrendingCoins(),
        store.fetchAllCoins(),
        store.fetchPortfolio(),
        store.fetchTransactions()
      ]);
    } catch (error) {
      console.error('Error initializing crypto data:', error);
    }
  },

  // Fetch trending coins
  fetchTrendingCoins: async () => {
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Get the top 5 coins with highest 24h change
      const trending = [...cryptocurrencies]
        .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
        .slice(0, 5);
      
      set({ trendingCoins: trending });
    } catch (error) {
      console.error('Error fetching trending coins:', error);
    }
  },

  // Fetch all coins
  fetchAllCoins: async () => {
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      set({ allCoins: cryptocurrencies });
    } catch (error) {
      console.error('Error fetching all coins:', error);
    }
  },

  // Fetch portfolio data
  fetchPortfolio: async () => {
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      set({ portfolio });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  },

  // Fetch transactions
  fetchTransactions: async () => {
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      set({ transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  },

  // Get a specific coin by ID
  getCoinById: (id: string): Cryptocurrency | null => {
    return cryptocurrencies.find(coin => coin.id === id) || null;
  },

  // Create a new transaction
  createTransaction: async (type: 'buy' | 'sell', coinId: string, amount: number, price: number) => {
    try {
      // Find the coin
      const coin = cryptocurrencies.find(c => c.id === coinId);
      if (!coin) return false;

      // Calculate total
      const total = amount * price;

      // Create new transaction
      const newTransaction: Transaction = {
        id: generateId(),
        type,
        coinId,
        coinSymbol: coin.symbol,
        coinName: coin.name,
        amount,
        price,
        total,
        timestamp: new Date().toISOString(),
        status: 'completed',
      };

      // Update transactions list
      const updatedTransactions = [newTransaction, ...get().transactions];
      set({ transactions: updatedTransactions });

      // Update portfolio
      const currentPortfolio = { ...get().portfolio };
      const currentAssets = [...currentPortfolio.assets];
      
      // Find if we already have this asset
      const assetIndex = currentAssets.findIndex(a => a.coinId === coinId);
      
      if (type === 'buy') {
        // Add to total balance
        currentPortfolio.totalBalance += total;
        
        if (assetIndex >= 0) {
          // Update existing asset
          currentAssets[assetIndex].amount += amount;
          currentAssets[assetIndex].valueUSD += total;
        } else {
          // Add new asset
          currentAssets.push({
            coinId,
            name: coin.name,
            symbol: coin.symbol,
            amount,
            valueUSD: total,
            percentageChange24h: coin.change24h,
            logoUrl: coin.logoUrl,
          });
        }
      } else if (type === 'sell') {
        // Subtract from total balance
        currentPortfolio.totalBalance -= total;
        
        if (assetIndex >= 0) {
          // Update existing asset
          currentAssets[assetIndex].amount -= amount;
          currentAssets[assetIndex].valueUSD -= total;
          
          // Remove asset if amount is zero or negative
          if (currentAssets[assetIndex].amount <= 0) {
            currentAssets.splice(assetIndex, 1);
          }
        }
      }
      
      currentPortfolio.assets = currentAssets;
      set({ portfolio: currentPortfolio });

      return true;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return false;
    }
  },
})); 