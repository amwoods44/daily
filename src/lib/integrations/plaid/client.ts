/**
 * Plaid Client
 *
 * Handles Plaid API integration for financial data:
 * - Account balances
 * - Transaction history
 * - Institution information
 *
 * Note: In production, all Plaid API calls must go through the backend.
 * This client provides type-safe wrappers for frontend consumption.
 */

import type {
  Account,
  Transaction,
  Bill,
  SpendingCategory,
  FinanceSnapshot,
  FinanceInsight,
  TransactionCategory,
} from '../../types';
import { mockFinance } from '../../mock-data';

// ============================================================================
// TYPES
// ============================================================================

interface PlaidLinkToken {
  link_token: string;
  expiration: string;
}

// PlaidPublicToken reserved for OAuth flow integration
interface _PlaidPublicToken {
  public_token: string;
  institution: {
    name: string;
    institution_id: string;
  };
}

interface PlaidAccount {
  account_id: string;
  name: string;
  official_name?: string;
  type: string;
  subtype: string;
  mask: string;
  balances: {
    current: number;
    available?: number;
    limit?: number;
  };
}

interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category?: string[];
  pending: boolean;
}

// ============================================================================
// API HELPERS
// ============================================================================

const API_BASE = '/api/finance';

async function fetchWithAuth(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// LINK TOKEN
// ============================================================================

/**
 * Create a Plaid Link token for initializing Link
 */
export async function createLinkToken(): Promise<PlaidLinkToken> {
  return fetchWithAuth('/link-token', { method: 'POST' });
}

/**
 * Exchange public token for access token
 * Called after successful Plaid Link flow
 */
export async function exchangePublicToken(publicToken: string): Promise<boolean> {
  await fetchWithAuth('/exchange-token', {
    method: 'POST',
    body: JSON.stringify({ public_token: publicToken }),
  });
  return true;
}

// ============================================================================
// ACCOUNTS
// ============================================================================

/**
 * Fetch all connected accounts
 */
export async function fetchAccounts(): Promise<Account[]> {
  try {
    const data = await fetchWithAuth('/accounts');
    return data.accounts.map(mapPlaidAccount);
  } catch (error) {
    console.warn('Failed to fetch accounts, using mock data:', error);
    return getMockAccounts();
  }
}

function mapPlaidAccount(plaid: PlaidAccount): Account {
  let type: Account['type'] = 'checking';
  if (plaid.type === 'credit') type = 'credit';
  else if (plaid.type === 'investment') type = 'investment';
  else if (plaid.subtype === 'savings') type = 'savings';
  else if (plaid.type === 'loan') type = 'loan';

  return {
    id: plaid.account_id,
    name: plaid.official_name || plaid.name,
    type,
    balance: plaid.balances.current,
    institution: 'Connected Bank',
    lastUpdated: new Date().toISOString(),
    mask: plaid.mask,
  };
}

function getMockAccounts(): Account[] {
  return [
    {
      id: 'checking-1',
      name: 'Primary Checking',
      type: 'checking',
      balance: mockFinance.checking,
      institution: 'Demo Bank',
      lastUpdated: new Date().toISOString(),
      mask: '1234',
    },
    {
      id: 'savings-1',
      name: 'Savings',
      type: 'savings',
      balance: mockFinance.savings,
      institution: 'Demo Bank',
      lastUpdated: new Date().toISOString(),
      mask: '5678',
    },
    {
      id: 'credit-1',
      name: 'Credit Card',
      type: 'credit',
      balance: mockFinance.creditCardBalance,
      institution: 'Demo Bank',
      lastUpdated: new Date().toISOString(),
      mask: '9012',
    },
  ];
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

/**
 * Fetch recent transactions
 */
export async function fetchTransactions(
  startDate?: string,
  endDate?: string
): Promise<Transaction[]> {
  try {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    const data = await fetchWithAuth(`/transactions?${params}`);
    return data.transactions.map(mapPlaidTransaction);
  } catch (error) {
    console.warn('Failed to fetch transactions, using mock data:', error);
    return getMockTransactions();
  }
}

function mapPlaidTransaction(plaid: PlaidTransaction): Transaction {
  const category = mapCategory(plaid.category?.[0]);

  return {
    id: plaid.transaction_id,
    accountId: plaid.account_id,
    amount: plaid.amount,
    date: plaid.date,
    description: plaid.name,
    category,
    merchant: plaid.merchant_name,
    pending: plaid.pending,
  };
}

function mapCategory(plaidCategory?: string): TransactionCategory {
  if (!plaidCategory) return 'other';

  const categoryMap: Record<string, TransactionCategory> = {
    'Food and Drink': 'food',
    'Travel': 'transport',
    'Transportation': 'transport',
    'Entertainment': 'entertainment',
    'Shopping': 'shopping',
    'Utilities': 'utilities',
    'Housing': 'housing',
    'Health': 'health',
    'Income': 'income',
  };

  return categoryMap[plaidCategory] || 'other';
}

function getMockTransactions(): Transaction[] {
  const now = new Date();
  return [
    {
      id: 'tx-1',
      accountId: 'checking-1',
      amount: -45.23,
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Whole Foods Market',
      category: 'food',
      merchant: 'Whole Foods',
    },
    {
      id: 'tx-2',
      accountId: 'credit-1',
      amount: -12.99,
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Netflix',
      category: 'entertainment',
      merchant: 'Netflix',
    },
    {
      id: 'tx-3',
      accountId: 'checking-1',
      amount: -35.00,
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Uber',
      category: 'transport',
      merchant: 'Uber',
    },
    {
      id: 'tx-4',
      accountId: 'checking-1',
      amount: 3500.00,
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Payroll',
      category: 'income',
    },
  ];
}

// ============================================================================
// BILLS DETECTION
// ============================================================================

/**
 * Detect recurring bills from transaction history
 */
export async function detectRecurringBills(_transactions: Transaction[]): Promise<Bill[]> {
  // In production, this would use AI to detect patterns
  // For now, use mock bills
  return mockFinance.upcomingBills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    amount: bill.amount,
    dueDate: bill.dueDate,
    daysUntilDue: bill.daysUntilDue,
    recurring: true,
    autopay: bill.autopay,
    status: bill.daysUntilDue <= 0 ? 'overdue' : bill.daysUntilDue <= 3 ? 'due_soon' : 'upcoming',
    category: bill.category,
  }));
}

// ============================================================================
// SPENDING ANALYSIS
// ============================================================================

/**
 * Calculate spending by category
 */
export function calculateSpendingByCategory(
  transactions: Transaction[]
): SpendingCategory[] {
  const spending: Record<TransactionCategory, number> = {
    food: 0,
    transport: 0,
    entertainment: 0,
    shopping: 0,
    utilities: 0,
    housing: 0,
    health: 0,
    income: 0,
    other: 0,
  };

  // Sum up spending by category (exclude income)
  transactions.forEach((tx) => {
    if (tx.amount < 0 && tx.category !== 'income') {
      spending[tx.category] += Math.abs(tx.amount);
    }
  });

  const totalSpending = Object.values(spending).reduce((a, b) => a + b, 0);

  return Object.entries(spending)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category: category as TransactionCategory,
      amount,
      percentOfTotal: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      trend: 'stable' as const,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// ============================================================================
// INSIGHTS GENERATION
// ============================================================================

/**
 * Generate financial insights
 */
export function generateFinanceInsights(
  accounts: Account[],
  transactions: Transaction[],
  bills: Bill[]
): FinanceInsight[] {
  const insights: FinanceInsight[] = [];

  // Check for low balance
  const checking = accounts.find((a) => a.type === 'checking');
  if (checking && checking.balance < 500) {
    insights.push({
      id: 'low-balance',
      type: 'warning',
      title: 'Low checking balance',
      description: `Only $${checking.balance.toFixed(2)} in checking. Upcoming bills may overdraw.`,
      priority: 'high',
    });
  }

  // Check for upcoming non-autopay bills
  const urgentBills = bills.filter((b) => !b.autopay && b.daysUntilDue !== undefined && b.daysUntilDue <= 3);
  if (urgentBills.length > 0) {
    insights.push({
      id: 'urgent-bills',
      type: 'warning',
      title: `${urgentBills.length} bill${urgentBills.length > 1 ? 's' : ''} due soon`,
      description: urgentBills.map((b) => b.name).join(', '),
      priority: 'high',
      action: {
        id: 'pay',
        label: 'Pay now',
        variant: 'primary',
        handler: 'pay_bills',
      },
    });
  }

  // Spending insights
  const spendingCategories = calculateSpendingByCategory(transactions);
  const topCategory = spendingCategories[0];
  if (topCategory && topCategory.percentOfTotal > 40) {
    insights.push({
      id: 'high-spending',
      type: 'info',
      title: `${Math.round(topCategory.percentOfTotal)}% spent on ${topCategory.category}`,
      description: `$${topCategory.amount.toFixed(2)} this month`,
      priority: 'low',
    });
  }

  // Savings rate
  const totalIncome = transactions
    .filter((t) => t.category === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    if (savingsRate > 20) {
      insights.push({
        id: 'savings-rate',
        type: 'success',
        title: `${Math.round(savingsRate)}% savings rate`,
        description: 'Great job keeping expenses below income!',
        priority: 'low',
      });
    } else if (savingsRate < 0) {
      insights.push({
        id: 'overspending',
        type: 'warning',
        title: 'Spending more than income',
        description: `You've spent $${Math.abs(totalIncome - totalExpenses).toFixed(2)} more than you earned.`,
        priority: 'high',
      });
    }
  }

  return insights;
}

// ============================================================================
// FULL SNAPSHOT
// ============================================================================

/**
 * Get complete financial snapshot
 */
export async function getFinanceSnapshot(): Promise<FinanceSnapshot> {
  const accounts = await fetchAccounts();
  const transactions = await fetchTransactions();
  const bills = await detectRecurringBills(transactions);
  const monthlySpending = calculateSpendingByCategory(transactions);
  const insights = generateFinanceInsights(accounts, transactions, bills);

  const totalBalance = accounts
    .filter((a) => a.type !== 'credit')
    .reduce((sum, a) => sum + a.balance, 0);

  return {
    accounts,
    totalBalance,
    recentTransactions: transactions.slice(0, 10),
    upcomingBills: bills,
    monthlySpending,
    insights,
  };
}
