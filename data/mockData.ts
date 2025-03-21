import { Cryptocurrency, Portfolio, Transaction, User } from '../types';
import { generateRandomSparkline } from '../utils/helpers';

// Mock cryptocurrency data
export const cryptocurrencies: Cryptocurrency[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 42356.78,
    change24h: 2.35,
    marketCap: 823456789012,
    volume24h: 32145678901,
    logoUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    sparklineData: [41230, 42134, 41890, 42356, 42567, 43012, 42356],
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 2431.56,
    change24h: 3.56,
    marketCap: 289456789012,
    volume24h: 12345678901,
    logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    sparklineData: [2390, 2410, 2380, 2431, 2450, 2480, 2431],
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    price: 124.75,
    change24h: 5.25,
    marketCap: 52456789012,
    volume24h: 3145678901,
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    sparklineData: [118, 120, 122, 124, 126, 125, 124],
  },
  {
    id: 'bnb',
    name: 'Binance Coin',
    symbol: 'BNB',
    price: 388.42,
    change24h: -1.25,
    marketCap: 59456789012,
    volume24h: 2145678901,
    logoUrl: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    sparklineData: [390, 389, 385, 388, 387, 389, 388],
  },
  {
    id: 'ada',
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.58,
    change24h: -0.85,
    marketCap: 20456789012,
    volume24h: 1145678901,
    logoUrl: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    sparklineData: [0.59, 0.58, 0.575, 0.58, 0.585, 0.58, 0.58],
  },
  {
    id: 'dot',
    name: 'Polkadot',
    symbol: 'DOT',
    price: 7.32,
    change24h: 1.75,
    marketCap: 9456789012,
    volume24h: 545678901,
    logoUrl: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    sparklineData: [7.1, 7.2, 7.25, 7.3, 7.35, 7.32, 7.32],
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    symbol: 'DOGE',
    price: 0.12,
    change24h: 3.45,
    marketCap: 6456789012,
    volume24h: 445678901,
    logoUrl: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    sparklineData: [0.115, 0.118, 0.12, 0.121, 0.122, 0.12, 0.12],
  },
  {
    id: 'link',
    name: 'Chainlink',
    symbol: 'LINK',
    price: 13.45,
    change24h: 2.15,
    marketCap: 7456789012,
    volume24h: 345678901,
    logoUrl: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    sparklineData: [13.1, 13.2, 13.3, 13.4, 13.5, 13.45, 13.45],
  },
  {
    id: 'uni',
    name: 'Uniswap',
    symbol: 'UNI',
    price: 7.85,
    change24h: -2.05,
    marketCap: 5456789012,
    volume24h: 245678901,
    logoUrl: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
    sparklineData: [8.0, 7.95, 7.9, 7.85, 7.8, 7.85, 7.85],
  },
  {
    id: 'avax',
    name: 'Avalanche',
    symbol: 'AVAX',
    price: 34.56,
    change24h: 4.25,
    marketCap: 11456789012,
    volume24h: 645678901,
    logoUrl: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    sparklineData: [33.1, 33.5, 34.0, 34.2, 34.5, 34.56, 34.56],
  },
];

// Mock portfolio data
export const portfolio: Portfolio = {
  totalBalance: 15428.45,
  profitLoss24h: 354.23,
  percentageChange24h: 2.35,
  assets: [
    {
      coinId: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: 0.24,
      valueUSD: 10165.63,
      percentageChange24h: 2.35,
      logoUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    },
    {
      coinId: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      amount: 1.58,
      valueUSD: 3841.86,
      percentageChange24h: 3.56,
      logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    },
    {
      coinId: 'sol',
      name: 'Solana',
      symbol: 'SOL',
      amount: 9.75,
      valueUSD: 1216.31,
      percentageChange24h: 5.25,
      logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    },
    {
      coinId: 'link',
      name: 'Chainlink',
      symbol: 'LINK',
      amount: 15.23,
      valueUSD: 204.84,
      percentageChange24h: 2.15,
      logoUrl: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    },
  ],
};

// Mock transactions data
export const transactions: Transaction[] = [
  {
    id: 'tx1',
    type: 'buy',
    coinId: 'btc',
    coinSymbol: 'BTC',
    coinName: 'Bitcoin',
    amount: 0.15,
    price: 41234.56,
    total: 6185.18,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'completed',
  },
  {
    id: 'tx2',
    type: 'buy',
    coinId: 'eth',
    coinSymbol: 'ETH',
    coinName: 'Ethereum',
    amount: 1.58,
    price: 2390.45,
    total: 3776.91,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: 'completed',
  },
  {
    id: 'tx3',
    type: 'sell',
    coinId: 'btc',
    coinSymbol: 'BTC',
    coinName: 'Bitcoin',
    amount: 0.05,
    price: 42356.78,
    total: 2117.84,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'completed',
  },
  {
    id: 'tx4',
    type: 'buy',
    coinId: 'sol',
    coinSymbol: 'SOL',
    coinName: 'Solana',
    amount: 9.75,
    price: 118.45,
    total: 1154.89,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: 'completed',
  },
  {
    id: 'tx5',
    type: 'buy',
    coinId: 'link',
    coinSymbol: 'LINK',
    coinName: 'Chainlink',
    amount: 15.23,
    price: 12.84,
    total: 195.55,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    status: 'completed',
  },
  {
    id: 'tx6',
    type: 'buy',
    coinId: 'btc',
    coinSymbol: 'BTC',
    coinName: 'Bitcoin',
    amount: 0.14,
    price: 40123.45,
    total: 5617.28,
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    status: 'completed',
  },
];

// Mock user data
export const user: User = {
  id: '1',
  username: 'cryptotrader',
  email: 'trader@example.com',
  avatar: 'https://i.pravatar.cc/150?img=12',
  createdAt: '2023-01-15T08:30:00Z',
}; 