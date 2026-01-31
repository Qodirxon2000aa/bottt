import React, { createContext, useContext, useState, ReactNode } from 'react';

// Mock user data
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isAdmin: boolean;
  balanceUZS: number;
  starsSpent: number;
}

export interface TelegramProfile {
  username: string;
  displayName: string;
  avatar?: string;
  verified: boolean;
  status: 'loading' | 'found' | 'not-found' | 'invalid' | 'idle';
}

export interface Transaction {
  id: string;
  recipientUsername: string;
  recipientDisplayName: string;
  stars: number;
  rateUZS: number;
  totalUZS: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  displayName: string;
  totalStars: number;
  totalUZS: number;
  avatar?: string;
}

export interface Contest {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  prizes: { place: number; reward: string }[];
  currentUserRank?: number;
  currentUserPoints?: number;
  isActive: boolean;
  isParticipating: boolean;
}

interface AppContextType {
  user: User;
  currentRate: number;
  lastRateUpdate: Date;
  transactions: Transaction[];
  leaderboard: LeaderboardEntry[];
  weeklyLeaderboard: LeaderboardEntry[];
  contest: Contest | null;
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => void;
  updateRate: (rate: number) => void;
  resetWeeklyLeaderboard: () => void;
  resetAllTimeLeaderboard: () => void;
  resetContest: () => void;
  lookupTelegramUser: (username: string) => Promise<TelegramProfile>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockUser: User = {
  id: '1',
  username: 'johndoe',
  displayName: 'John Doe',
  isAdmin: true,
  balanceUZS: 5000000,
  starsSpent: 1250
};

const mockTransactions: Transaction[] = [
  {
    id: '1',
    recipientUsername: 'alice',
    recipientDisplayName: 'Alice Smith',
    stars: 100,
    rateUZS: 1500,
    totalUZS: 150000,
    status: 'completed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    recipientUsername: 'bob_crypto',
    recipientDisplayName: 'Bob Johnson',
    stars: 250,
    rateUZS: 1500,
    totalUZS: 375000,
    status: 'completed',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    recipientUsername: 'charlie_dev',
    recipientDisplayName: 'Charlie Brown',
    stars: 50,
    rateUZS: 1500,
    totalUZS: 75000,
    status: 'pending',
    timestamp: new Date(Date.now() - 10 * 60 * 1000)
  }
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'whale_user', displayName: 'Crypto Whale', totalStars: 50000, totalUZS: 75000000 },
  { rank: 2, username: 'top_buyer', displayName: 'Star Collector', totalStars: 35000, totalUZS: 52500000 },
  { rank: 3, username: 'johndoe', displayName: 'John Doe', totalStars: 25000, totalUZS: 37500000 },
  { rank: 4, username: 'star_fan', displayName: 'Star Fan', totalStars: 18000, totalUZS: 27000000 },
  { rank: 5, username: 'buyer123', displayName: 'Buyer 123', totalStars: 12000, totalUZS: 18000000 },
  { rank: 6, username: 'telegram_pro', displayName: 'Telegram Pro', totalStars: 9500, totalUZS: 14250000 },
  { rank: 7, username: 'stars_lover', displayName: 'Stars Lover', totalStars: 7200, totalUZS: 10800000 },
  { rank: 8, username: 'crypto_king', displayName: 'Crypto King', totalStars: 5800, totalUZS: 8700000 }
];

const mockWeeklyLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'johndoe', displayName: 'John Doe', totalStars: 1250, totalUZS: 1875000 },
  { rank: 2, username: 'weekly_star', displayName: 'Weekly Star', totalStars: 980, totalUZS: 1470000 },
  { rank: 3, username: 'fast_buyer', displayName: 'Fast Buyer', totalStars: 750, totalUZS: 1125000 },
  { rank: 4, username: 'star_rush', displayName: 'Star Rush', totalStars: 620, totalUZS: 930000 },
  { rank: 5, username: 'quick_buy', displayName: 'Quick Buy', totalStars: 450, totalUZS: 675000 }
];

const mockContest: Contest = {
  id: 'weekly-1',
  name: 'Weekly Stars Sprint',
  startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  prizes: [
    { place: 1, reward: '1,000,000 UZS + Premium Badge' },
    { place: 2, reward: '500,000 UZS' },
    { place: 3, reward: '250,000 UZS' }
  ],
  currentUserRank: 1,
  currentUserPoints: 1250,
  isActive: true,
  isParticipating: true
};

// Mock Telegram user lookup with realistic delay
const mockTelegramUsers: Record<string, TelegramProfile> = {
  alice: { username: 'alice', displayName: 'Alice Smith', verified: true, status: 'found' },
  bob_crypto: { username: 'bob_crypto', displayName: 'Bob Johnson', verified: false, status: 'found' },
  charlie_dev: { username: 'charlie_dev', displayName: 'Charlie Brown', verified: true, status: 'found' },
  durov: { username: 'durov', displayName: 'Pavel Durov', verified: true, status: 'found' },
  telegram: { username: 'telegram', displayName: 'Telegram', verified: true, status: 'found' }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRate] = useState(1500);
  const [lastRateUpdate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>(mockWeeklyLeaderboard);
  const [contest, setContest] = useState<Contest | null>(mockContest);

  const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => {
    const newTransaction: Transaction = {
      ...tx,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'pending'
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Simulate transaction completion after 2 seconds
    setTimeout(() => {
      setTransactions(prev => 
        prev.map(t => t.id === newTransaction.id ? { ...t, status: 'completed' } : t)
      );
    }, 2000);
  };

  const updateRate = (rate: number) => {
    // In a real app, this would update the rate via API
    console.log('Rate updated to:', rate);
  };

  const resetWeeklyLeaderboard = () => {
    setWeeklyLeaderboard([]);
  };

  const resetAllTimeLeaderboard = () => {
    setLeaderboard([]);
  };

  const resetContest = () => {
    setContest(null);
  };

  const lookupTelegramUser = async (username: string): Promise<TelegramProfile> => {
    // Remove @ if present
    const cleanUsername = username.replace('@', '').trim();
    
    if (!cleanUsername) {
      return { username: '', displayName: '', verified: false, status: 'idle' };
    }
    
    // Validate username format
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(cleanUsername)) {
      return { username: cleanUsername, displayName: '', verified: false, status: 'invalid' };
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const found = mockTelegramUsers[cleanUsername];
    if (found) {
      return found;
    }
    
    return { username: cleanUsername, displayName: '', verified: false, status: 'not-found' };
  };

  return (
    <AppContext.Provider
      value={{
        user: mockUser,
        currentRate,
        lastRateUpdate,
        transactions,
        leaderboard,
        weeklyLeaderboard,
        contest,
        addTransaction,
        updateRate,
        resetWeeklyLeaderboard,
        resetAllTimeLeaderboard,
        resetContest,
        lookupTelegramUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
