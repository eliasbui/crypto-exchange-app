import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletState, PortfolioAsset, Transaction } from '../types';
import { portfolio, transactions } from '../data/mockData';
import { generateId } from '../utils/helpers';

// Storage keys
const WALLET_BALANCE_KEY = '@crypto_exchange_wallet_balance';
const WALLET_HOLDINGS_KEY = '@crypto_exchange_wallet_holdings';
const WALLET_TRANSACTIONS_KEY = '@crypto_exchange_wallet_transactions';

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 10000, // Default starting balance
  holdings: portfolio.assets,
  transactions: transactions,
  
  // Initialize wallet data from storage
  initialize: async () => {
    try {
      // Get stored values from AsyncStorage
      const storedBalanceJson = await AsyncStorage.getItem(WALLET_BALANCE_KEY);
      const storedHoldingsJson = await AsyncStorage.getItem(WALLET_HOLDINGS_KEY);
      const storedTransactionsJson = await AsyncStorage.getItem(WALLET_TRANSACTIONS_KEY);
      
      // Parse stored values or use defaults
      const storedBalance = storedBalanceJson ? parseFloat(storedBalanceJson) : 10000;
      const storedHoldings = storedHoldingsJson ? JSON.parse(storedHoldingsJson) : portfolio.assets;
      const storedTransactions = storedTransactionsJson ? JSON.parse(storedTransactionsJson) : transactions;
      
      // Update state
      set({
        balance: storedBalance,
        holdings: storedHoldings,
        transactions: storedTransactions
      });
    } catch (error) {
      console.error('Error initializing wallet:', error);
      
      // Fallback to defaults if error
      set({
        balance: 10000,
        holdings: portfolio.assets,
        transactions: transactions
      });
    }
  },
  
  // Update wallet balance
  updateBalance: (amount: number) => {
    set((state) => {
      const newBalance = state.balance + amount;
      
      // Save to AsyncStorage
      AsyncStorage.setItem(WALLET_BALANCE_KEY, newBalance.toString());
      
      return { balance: newBalance };
    });
  },
  
  // Add a new transaction
  addTransaction: (transaction: Transaction) => {
    set((state) => {
      const updatedTransactions = [transaction, ...state.transactions];
      
      // Save to AsyncStorage
      AsyncStorage.setItem(WALLET_TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
      
      // Update holdings based on transaction
      const updatedHoldings = [...state.holdings];
      const holdingIndex = updatedHoldings.findIndex(h => h.coinId === transaction.coinId);
      
      if (transaction.type === 'buy') {
        if (holdingIndex >= 0) {
          // Update existing holding
          updatedHoldings[holdingIndex].amount += transaction.amount;
          updatedHoldings[holdingIndex].valueUSD += transaction.total;
        } else {
          // Add new holding
          updatedHoldings.push({
            coinId: transaction.coinId,
            name: transaction.coinName,
            symbol: transaction.coinSymbol,
            amount: transaction.amount,
            valueUSD: transaction.total,
            percentageChange24h: 0, // This would be updated when fetching market data
            logoUrl: '', // This would be updated when fetching market data
          });
        }
      } else if (transaction.type === 'sell') {
        if (holdingIndex >= 0) {
          // Update existing holding
          updatedHoldings[holdingIndex].amount -= transaction.amount;
          updatedHoldings[holdingIndex].valueUSD -= transaction.total;
          
          // Remove holding if amount is zero or negative
          if (updatedHoldings[holdingIndex].amount <= 0) {
            updatedHoldings.splice(holdingIndex, 1);
          }
        }
      }
      
      // Save holdings to AsyncStorage
      AsyncStorage.setItem(WALLET_HOLDINGS_KEY, JSON.stringify(updatedHoldings));
      
      return { 
        transactions: updatedTransactions,
        holdings: updatedHoldings
      };
    });
  },
  
  // Get current holdings
  getHoldings: (): PortfolioAsset[] => {
    return get().holdings;
  }
})); 