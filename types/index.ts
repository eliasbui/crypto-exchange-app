export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  logoUrl: string;
  sparklineData?: number[];
}

export interface Portfolio {
  totalBalance: number;
  profitLoss24h: number;
  percentageChange24h: number;
  assets: PortfolioAsset[];
}

export interface PortfolioAsset {
  coinId: string;
  name: string;
  symbol: string;
  amount: number;
  valueUSD: number;
  percentageChange24h: number;
  logoUrl: string;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  price: number;
  total: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export type ThemeType = 'light' | 'dark';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  tempEmail: string;
  otpPurpose: string;
  isOtpVerified: boolean;
  isBiometricEnabled: boolean;
  isPinEnabled: boolean;
  isOtpEnabled: boolean;
  pinCode: string;
  
  // Auth methods
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // OTP methods
  setTempEmail: (email: string) => void;
  setOtpPurpose: (purpose: string) => void;
  verifyOTP: (otp: string) => Promise<boolean>;
  resetOtpVerification: () => void;
  completeLogin: () => Promise<boolean>;
  completeRegistration: (username: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  
  // Authentication settings
  setBiometricEnabled: (enabled: boolean) => Promise<boolean>;
  setPinEnabled: (enabled: boolean) => Promise<boolean>;
  setPinCode: (pinCode: string) => Promise<boolean>;
  verifyPinCode: (pinCode: string) => boolean;
  setOtpEnabled: (enabled: boolean) => Promise<boolean>;
}

export interface CryptoState {
  trendingCoins: Cryptocurrency[];
  allCoins: Cryptocurrency[];
  portfolio: Portfolio;
  transactions: Transaction[];
  initialize: () => Promise<void>;
  fetchTrendingCoins: () => void;
  fetchAllCoins: () => void;
  fetchPortfolio: () => void;
  fetchTransactions: () => void;
  getCoinById: (id: string) => Cryptocurrency | null;
  createTransaction: (type: 'buy' | 'sell', coinId: string, amount: number, price: number) => Promise<boolean>;
}

export interface WalletState {
  balance: number;
  holdings: PortfolioAsset[];
  transactions: Transaction[];
  initialize: () => Promise<void>;
  updateBalance: (amount: number) => void;
  addTransaction: (transaction: Transaction) => void;
  getHoldings: () => PortfolioAsset[];
}

export interface UIState {
  theme: ThemeType;
  language: string;
  notificationsEnabled: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  setLanguage: (language: string) => void;
  toggleNotifications: () => void;
}

export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
  Login: undefined;
  Register: undefined;
  Modal: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Market: undefined;
  Trade: undefined;
  Wallet: undefined;
  Settings: undefined;
}; 