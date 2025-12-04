import { getGeminiModel } from './gemini-client';
import { getFinancialTransactions, getRevenueByYear, getExpensesByYear, getProfitLossData } from '../supabase/queries';

// Query intent classification
export type QueryIntent =
  | 'revenue_query'
  | 'expense_query'
  | 'profit_query'
  | 'comparison_query'
  | 'report_request'
  | 'document_upload'
  | 'faq_question'
  | 'general_chat'
  | 'escalation_request';

export interface ParsedQuery {
  intent: QueryIntent;
  confidence: number;
  parameters: {
    fiscalYear?: number;
    fiscalYears?: number[];
    transactionType?: 'revenue' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
    reportType?: 'profit_loss' | 'balance_sheet' | 'expense_report';
    format?: 'excel' | 'pdf';
  };
  rawQuery: string;
}

/**
 * Parse natural language query to determine intent and extract parameters
 */
export async function parseFinancialQuery(query: string): Promise<ParsedQuery> {
  const model = getGeminiModel();

  const prompt = `You are a financial data query parser. Analyze this user query and extract:
1. Intent: revenue_query, expense_query, profit_query, comparison_query, report_request, document_upload, faq_question, general_chat, or escalation_request
2. Confidence: 0.0 to 1.0 (how confident you are in the classification)
3. Parameters: Extract years, transaction types, categories, date ranges, report types, or formats

User Query: "${query}"

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "intent": "intent_type",
  "confidence": 0.95,
  "parameters": {
    "fiscalYear": 2024,
    "transactionType": "revenue"
  }
}

Examples:
- "What was my revenue in 2024?" → {"intent": "revenue_query", "confidence": 0.95, "parameters": {"fiscalYear": 2024}}
- "Compare expenses 2023 vs 2024" → {"intent": "comparison_query", "confidence": 0.9, "parameters": {"fiscalYears": [2023, 2024], "transactionType": "expense"}}
- "Send me P&L for last year" → {"intent": "report_request", "confidence": 0.85, "parameters": {"reportType": "profit_loss", "fiscalYear": 2023}}
- "What services do you offer?" → {"intent": "faq_question", "confidence": 0.9, "parameters": {}}
- "I need to speak with an accountant" → {"intent": "escalation_request", "confidence": 1.0, "parameters": {}}

Now parse: "${query}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Remove markdown code blocks if present
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(jsonText);

    return {
      intent: parsed.intent,
      confidence: parsed.confidence,
      parameters: parsed.parameters || {},
      rawQuery: query,
    };
  } catch (error) {
    console.error('Error parsing query:', error);

    // Fallback to simple keyword matching
    return fallbackParse(query);
  }
}

/**
 * Fallback parser using simple keyword matching
 */
function fallbackParse(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();

  // Escalation requests
  if (
    lowerQuery.includes('speak with') ||
    lowerQuery.includes('talk to') ||
    lowerQuery.includes('escalate') ||
    lowerQuery.includes('human') ||
    lowerQuery.includes('accountant')
  ) {
    return {
      intent: 'escalation_request',
      confidence: 0.95,
      parameters: {},
      rawQuery: query,
    };
  }

  // Report requests
  if (
    lowerQuery.includes('send me') ||
    lowerQuery.includes('generate') ||
    lowerQuery.includes('create report') ||
    lowerQuery.includes('p&l') ||
    lowerQuery.includes('profit and loss')
  ) {
    const year = extractYear(query);
    return {
      intent: 'report_request',
      confidence: 0.8,
      parameters: {
        reportType: 'profit_loss',
        fiscalYear: year,
        format: lowerQuery.includes('pdf') ? 'pdf' : 'excel',
      },
      rawQuery: query,
    };
  }

  // Revenue queries
  if (lowerQuery.includes('revenue') || lowerQuery.includes('income') || lowerQuery.includes('sales')) {
    const years = extractYears(query);
    if (years.length > 1) {
      return {
        intent: 'comparison_query',
        confidence: 0.85,
        parameters: {
          fiscalYears: years,
          transactionType: 'revenue',
        },
        rawQuery: query,
      };
    }
    return {
      intent: 'revenue_query',
      confidence: 0.85,
      parameters: {
        fiscalYear: years[0] || new Date().getFullYear(),
        transactionType: 'revenue',
      },
      rawQuery: query,
    };
  }

  // Expense queries
  if (lowerQuery.includes('expense') || lowerQuery.includes('cost') || lowerQuery.includes('spending')) {
    const years = extractYears(query);
    if (years.length > 1) {
      return {
        intent: 'comparison_query',
        confidence: 0.85,
        parameters: {
          fiscalYears: years,
          transactionType: 'expense',
        },
        rawQuery: query,
      };
    }
    return {
      intent: 'expense_query',
      confidence: 0.85,
      parameters: {
        fiscalYear: years[0] || new Date().getFullYear(),
        transactionType: 'expense',
      },
      rawQuery: query,
    };
  }

  // Profit queries
  if (lowerQuery.includes('profit') || lowerQuery.includes('net income')) {
    const year = extractYear(query);
    return {
      intent: 'profit_query',
      confidence: 0.85,
      parameters: {
        fiscalYear: year,
      },
      rawQuery: query,
    };
  }

  // FAQ questions
  if (
    lowerQuery.includes('what') ||
    lowerQuery.includes('how') ||
    lowerQuery.includes('when') ||
    lowerQuery.includes('why') ||
    lowerQuery.includes('?')
  ) {
    return {
      intent: 'faq_question',
      confidence: 0.6,
      parameters: {},
      rawQuery: query,
    };
  }

  // Default to general chat
  return {
    intent: 'general_chat',
    confidence: 0.5,
    parameters: {},
    rawQuery: query,
  };
}

/**
 * Extract year from query (e.g., "2024", "last year", "this year")
 */
function extractYear(query: string): number {
  const currentYear = new Date().getFullYear();

  // Check for specific year mentions (2020-2099)
  const yearMatch = query.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }

  // Check for relative year references
  if (query.toLowerCase().includes('last year')) {
    return currentYear - 1;
  }

  if (query.toLowerCase().includes('this year') || query.toLowerCase().includes('current year')) {
    return currentYear;
  }

  if (query.toLowerCase().includes('next year')) {
    return currentYear + 1;
  }

  // Default to current year
  return currentYear;
}

/**
 * Extract multiple years for comparisons
 */
function extractYears(query: string): number[] {
  const years: number[] = [];
  const yearMatches = query.match(/\b(20\d{2})\b/g);

  if (yearMatches) {
    return yearMatches.map((y) => parseInt(y));
  }

  // Check for "vs", "versus", "compared to"
  if (
    query.toLowerCase().includes(' vs ') ||
    query.toLowerCase().includes(' versus ') ||
    query.toLowerCase().includes('compared')
  ) {
    const currentYear = new Date().getFullYear();
    if (query.toLowerCase().includes('last year')) {
      return [currentYear - 1, currentYear];
    }
    // Default to comparing last two years
    return [currentYear - 1, currentYear];
  }

  return years;
}

/**
 * Execute financial query against database
 */
export async function executeFinancialQuery(
  companyId: string,
  parsedQuery: ParsedQuery
): Promise<{
  data: any;
  summary: string;
}> {
  const { intent, parameters } = parsedQuery;

  try {
    switch (intent) {
      case 'revenue_query': {
        const year = parameters.fiscalYear || new Date().getFullYear();
        const revenue = await getRevenueByYear(companyId, year);
        return {
          data: { revenue, year },
          summary: `Your total revenue for ${year} was ${formatCurrency(revenue)}.`,
        };
      }

      case 'expense_query': {
        const year = parameters.fiscalYear || new Date().getFullYear();
        const expenses = await getExpensesByYear(companyId, year);
        return {
          data: { expenses, year },
          summary: `Your total expenses for ${year} were ${formatCurrency(expenses)}.`,
        };
      }

      case 'profit_query': {
        const year = parameters.fiscalYear || new Date().getFullYear();
        const revenue = await getRevenueByYear(companyId, year);
        const expenses = await getExpensesByYear(companyId, year);
        const profit = revenue - expenses;
        return {
          data: { revenue, expenses, profit, year },
          summary: `For ${year}: Revenue ${formatCurrency(revenue)}, Expenses ${formatCurrency(
            expenses
          )}, Net Profit ${formatCurrency(profit)}.`,
        };
      }

      case 'comparison_query': {
        const years = parameters.fiscalYears || [new Date().getFullYear() - 1, new Date().getFullYear()];
        const type = parameters.transactionType || 'revenue';

        const dataByYear = await Promise.all(
          years.map(async (year) => {
            if (type === 'revenue') {
              const amount = await getRevenueByYear(companyId, year);
              return { year, amount };
            } else {
              const amount = await getExpensesByYear(companyId, year);
              return { year, amount };
            }
          })
        );

        const comparison = dataByYear
          .map((d) => `${d.year}: ${formatCurrency(d.amount)}`)
          .join(' | ');

        const percentChange =
          dataByYear.length === 2
            ? ((dataByYear[1].amount - dataByYear[0].amount) / dataByYear[0].amount) * 100
            : 0;

        const changeText =
          percentChange > 0
            ? `↑${percentChange.toFixed(1)}%`
            : percentChange < 0
            ? `↓${Math.abs(percentChange).toFixed(1)}%`
            : 'no change';

        return {
          data: dataByYear,
          summary: `${type === 'revenue' ? 'Revenue' : 'Expenses'} comparison: ${comparison} (${changeText})`,
        };
      }

      default:
        return {
          data: null,
          summary: 'Query type not yet implemented.',
        };
    }
  } catch (error) {
    console.error('Error executing financial query:', error);
    throw error;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
