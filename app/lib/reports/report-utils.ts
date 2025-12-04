import { getFinancialTransactions } from '../supabase/queries';
import type { Database } from '../supabase/types';

type FinancialTransaction = Database['public']['Tables']['financial_transactions']['Row'];

export interface ProfitLossData {
  companyName: string;
  fiscalYear: number;
  generatedDate: string;
  revenue: {
    total: number;
    items: CategoryBreakdown[];
  };
  expenses: {
    total: number;
    items: CategoryBreakdown[];
  };
  netProfit: number;
  profitMargin: number;
}

export interface CategoryBreakdown {
  category: string;
  subcategories?: SubcategoryBreakdown[];
  amount: number;
  percentage: number;
}

export interface SubcategoryBreakdown {
  name: string;
  amount: number;
}

export interface ExpenseReport {
  companyName: string;
  fiscalYear: number;
  fiscalQuarter?: number;
  generatedDate: string;
  totalExpenses: number;
  expensesByCategory: CategoryBreakdown[];
  topExpenses: {
    description: string;
    amount: number;
    date: string;
    category: string;
  }[];
}

/**
 * Generate Profit & Loss statement data
 */
export async function generateProfitLossData(
  companyId: string,
  fiscalYear: number,
  companyName: string
): Promise<ProfitLossData> {
  // Get all transactions for the year
  const transactions = await getFinancialTransactions(companyId, { fiscalYear });

  // Separate revenue and expenses
  const revenueTransactions = transactions.filter((t) => t.transaction_type === 'revenue');
  const expenseTransactions = transactions.filter((t) => t.transaction_type === 'expense');

  // Calculate revenue breakdown by category
  const revenueByCategory = aggregateByCategory(revenueTransactions);
  const totalRevenue = revenueByCategory.reduce((sum, cat) => sum + cat.amount, 0);

  // Calculate expense breakdown by category
  const expenseByCategory = aggregateByCategory(expenseTransactions);
  const totalExpenses = expenseByCategory.reduce((sum, cat) => sum + Math.abs(cat.amount), 0);

  // Calculate percentages
  revenueByCategory.forEach((cat) => {
    cat.percentage = totalRevenue > 0 ? (cat.amount / totalRevenue) * 100 : 0;
  });

  expenseByCategory.forEach((cat) => {
    cat.amount = Math.abs(cat.amount);
    cat.percentage = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
  });

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    companyName,
    fiscalYear,
    generatedDate: new Date().toISOString(),
    revenue: {
      total: totalRevenue,
      items: revenueByCategory,
    },
    expenses: {
      total: totalExpenses,
      items: expenseByCategory,
    },
    netProfit,
    profitMargin,
  };
}

/**
 * Generate Expense Report data
 */
export async function generateExpenseReportData(
  companyId: string,
  fiscalYear: number,
  companyName: string,
  fiscalQuarter?: number
): Promise<ExpenseReport> {
  // Get transactions
  const transactions = await getFinancialTransactions(companyId, {
    fiscalYear,
    fiscalQuarter,
    transactionType: 'expense',
  });

  // Aggregate by category
  const expensesByCategory = aggregateByCategory(transactions);
  const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + Math.abs(cat.amount), 0);

  // Calculate percentages
  expensesByCategory.forEach((cat) => {
    cat.amount = Math.abs(cat.amount);
    cat.percentage = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
  });

  // Get top 10 individual expenses
  const topExpenses = transactions
    .map((t) => ({
      description: t.description,
      amount: Math.abs(t.amount),
      date: t.transaction_date,
      category: t.category,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  return {
    companyName,
    fiscalYear,
    fiscalQuarter,
    generatedDate: new Date().toISOString(),
    totalExpenses,
    expensesByCategory,
    topExpenses,
  };
}

/**
 * Aggregate transactions by category and subcategory
 */
function aggregateByCategory(transactions: FinancialTransaction[]): CategoryBreakdown[] {
  const categoryMap = new Map<string, Map<string, number>>();

  // Group by category and subcategory
  transactions.forEach((transaction) => {
    const category = transaction.category;
    const subcategory = transaction.subcategory || 'Other';
    const amount = transaction.amount;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Map());
    }

    const subcategoryMap = categoryMap.get(category)!;
    subcategoryMap.set(subcategory, (subcategoryMap.get(subcategory) || 0) + amount);
  });

  // Convert to array format
  const breakdown: CategoryBreakdown[] = [];

  categoryMap.forEach((subcategoryMap, category) => {
    const subcategories: SubcategoryBreakdown[] = [];
    let categoryTotal = 0;

    subcategoryMap.forEach((amount, subcategory) => {
      subcategories.push({ name: subcategory, amount });
      categoryTotal += amount;
    });

    breakdown.push({
      category,
      subcategories: subcategories.length > 1 ? subcategories : undefined,
      amount: categoryTotal,
      percentage: 0, // Will be calculated later
    });
  });

  // Sort by amount (descending)
  breakdown.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  return breakdown;
}

/**
 * Format currency for reports
 */
export function formatCurrency(amount: number, includeCents: boolean = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date for reports
 */
export function formatReportDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format date for file names
 */
export function formatFileDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Generate file name for report
 */
export function generateReportFileName(
  reportType: string,
  companyName: string,
  fiscalYear: number,
  format: 'xlsx' | 'pdf'
): string {
  const sanitizedName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const date = formatFileDate();
  return `${reportType}_${sanitizedName}_${fiscalYear}_${date}.${format}`;
}
