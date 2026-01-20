/**
 * Extended Finance Mock Data
 *
 * Provides data for Finance drill-down page including:
 * - Account breakdown (checking, savings, investments, credit)
 * - Agent activity feed (automated financial actions)
 * - Net worth calculations
 */

import type { FinanceOverview } from './mock-data';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Account {
  id: string;
  type: 'checking' | 'savings' | 'investment' | '401k' | 'credit';
  label: string;
  balance: number;
  percentage: number; // % of total net worth
  trend?: number; // % change this month
  icon: string; // Lucide icon name
}

export interface AgentActivity {
  id: string;
  type: 'bill_reminder' | 'cashback' | 'budget_alert' | 'auto_payment' | 'investment' | 'spending_insight';
  timestamp: string; // ISO date
  description: string;
  status: 'success' | 'warning' | 'info' | 'error';
  badge?: string; // e.g., "$12.34", "3 days", "+15%"
  actionable?: boolean;
}

export interface SpendingCategory {
  id: string;
  name: string;
  amount: number;
  budget: number;
  trend: number; // % vs last month
  percentage: number; // % of total spending
  icon: string; // Lucide icon name
}

export interface ExtendedFinanceData extends FinanceOverview {
  accounts: Account[];
  agentActivities: AgentActivity[];
  spendingCategories: SpendingCategory[];
  netWorth: number;
  netWorthChange: number; // %
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const mockAccounts: Account[] = [
  {
    id: 'acc1',
    type: 'checking',
    label: 'Checking',
    balance: 4250.32,
    percentage: 2.9,
    trend: -5.2,
    icon: 'Wallet',
  },
  {
    id: 'acc2',
    type: 'savings',
    label: 'Savings',
    balance: 15000,
    percentage: 10.3,
    trend: 3.2,
    icon: 'PiggyBank',
  },
  {
    id: 'acc3',
    type: 'investment',
    label: 'Investments',
    balance: 127450,
    percentage: 87.4,
    trend: 2.3,
    icon: 'TrendingUp',
  },
  {
    id: 'acc4',
    type: '401k',
    label: '401(k)',
    balance: 0, // Not tracked yet
    percentage: 0,
    icon: 'Building',
  },
  {
    id: 'acc5',
    type: 'credit',
    label: 'Credit Cards',
    balance: -1847.23, // Negative for debt
    percentage: -1.3,
    icon: 'CreditCard',
  },
];

export const mockAgentActivities: AgentActivity[] = [
  {
    id: 'act1',
    type: 'bill_reminder',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    description: 'Electric bill due in 3 days',
    status: 'warning',
    badge: '3 days',
    actionable: true,
  },
  {
    id: 'act2',
    type: 'cashback',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
    description: 'Cashback rewards deposited',
    status: 'success',
    badge: '$12.34',
  },
  {
    id: 'act3',
    type: 'budget_alert',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
    description: 'Food & Dining over budget by 15%',
    status: 'warning',
    badge: '+15%',
  },
  {
    id: 'act4',
    type: 'auto_payment',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18h ago
    description: 'Rent payment processed ($2,400)',
    status: 'success',
    badge: '$2,400',
  },
  {
    id: 'act5',
    type: 'investment',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago
    description: 'Portfolio rebalanced — moved to bonds',
    status: 'info',
  },
  {
    id: 'act6',
    type: 'spending_insight',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5d ago
    description: 'Coffee spending up 45% this week',
    status: 'info',
    badge: '+45%',
  },
  {
    id: 'act7',
    type: 'bill_reminder',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2d ago
    description: 'Adobe subscription renewing tomorrow ($59.99)',
    status: 'warning',
    badge: '1 day',
    actionable: true,
  },
];

export const mockSpendingCategories: SpendingCategory[] = [
  {
    id: 'cat1',
    name: 'Housing',
    amount: 2400,
    budget: 2400,
    trend: 0,
    percentage: 44,
    icon: 'Home',
  },
  {
    id: 'cat2',
    name: 'Food & Dining',
    amount: 847,
    budget: 800,
    trend: 12.5,
    percentage: 15.6,
    icon: 'Utensils',
  },
  {
    id: 'cat3',
    name: 'Transportation',
    amount: 420,
    budget: 500,
    trend: -8.2,
    percentage: 7.7,
    icon: 'Car',
  },
  {
    id: 'cat4',
    name: 'Utilities',
    amount: 320,
    budget: 350,
    trend: 2.1,
    percentage: 5.9,
    icon: 'Zap',
  },
  {
    id: 'cat5',
    name: 'Shopping',
    amount: 234,
    budget: 300,
    trend: -15.3,
    percentage: 4.3,
    icon: 'ShoppingBag',
  },
  {
    id: 'cat6',
    name: 'Entertainment',
    amount: 156,
    budget: 200,
    trend: 5.4,
    percentage: 2.9,
    icon: 'Film',
  },
  {
    id: 'cat7',
    name: 'Health',
    amount: 89,
    budget: 150,
    trend: -10.1,
    percentage: 1.6,
    icon: 'Activity',
  },
];

// Calculate net worth (assets - liabilities)
const calculateNetWorth = (accounts: Account[]): number => {
  return accounts.reduce((total, acc) => total + acc.balance, 0);
};

// Build extended finance data by combining with existing mock data
export const buildExtendedFinanceData = (baseFinance: FinanceOverview): ExtendedFinanceData => {
  const netWorth = calculateNetWorth(mockAccounts);

  return {
    ...baseFinance,
    accounts: mockAccounts,
    agentActivities: mockAgentActivities,
    spendingCategories: mockSpendingCategories,
    netWorth,
    netWorthChange: 5.2, // % change this month
  };
};
