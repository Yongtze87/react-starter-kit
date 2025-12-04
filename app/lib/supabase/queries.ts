import { supabase } from './client';
import type { Database } from './types';

type User = Database['public']['Tables']['users']['Row'];
type Company = Database['public']['Tables']['companies']['Row'];
type FinancialTransaction = Database['public']['Tables']['financial_transactions']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];
type Conversation = Database['public']['Tables']['conversations']['Row'];
type FAQ = Database['public']['Tables']['faq_content']['Row'];
type Escalation = Database['public']['Tables']['escalations']['Row'];

// ============================================
// USER QUERIES
// ============================================

export const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const getUserByPhoneNumber = async (phoneNumber: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('phone_number', phoneNumber)
    .single();

  if (error) throw error;
  return data;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return getUserById(user.id);
};

// ============================================
// COMPANY QUERIES
// ============================================

export const getCompanyById = async (companyId: string) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// FINANCIAL TRANSACTION QUERIES
// ============================================

export const getFinancialTransactions = async (
  companyId: string,
  filters?: {
    fiscalYear?: number;
    fiscalQuarter?: number;
    transactionType?: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
    startDate?: string;
    endDate?: string;
  }
) => {
  let query = supabase
    .from('financial_transactions')
    .select('*')
    .eq('company_id', companyId)
    .order('transaction_date', { ascending: false });

  if (filters?.fiscalYear) {
    query = query.eq('fiscal_year', filters.fiscalYear);
  }

  if (filters?.fiscalQuarter) {
    query = query.eq('fiscal_quarter', filters.fiscalQuarter);
  }

  if (filters?.transactionType) {
    query = query.eq('transaction_type', filters.transactionType);
  }

  if (filters?.startDate) {
    query = query.gte('transaction_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('transaction_date', filters.endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getRevenueByYear = async (companyId: string, fiscalYear: number) => {
  const { data, error } = await supabase
    .from('financial_transactions')
    .select('amount')
    .eq('company_id', companyId)
    .eq('fiscal_year', fiscalYear)
    .eq('transaction_type', 'revenue');

  if (error) throw error;

  const total = data.reduce((sum, transaction) => sum + transaction.amount, 0);
  return total;
};

export const getExpensesByYear = async (companyId: string, fiscalYear: number) => {
  const { data, error } = await supabase
    .from('financial_transactions')
    .select('amount')
    .eq('company_id', companyId)
    .eq('fiscal_year', fiscalYear)
    .eq('transaction_type', 'expense');

  if (error) throw error;

  const total = data.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  return total;
};

export const getProfitLossData = async (companyId: string, fiscalYear: number) => {
  const { data, error } = await supabase
    .from('view_profit_loss')
    .select('*')
    .eq('company_id', companyId)
    .eq('fiscal_year', fiscalYear)
    .order('fiscal_quarter', { ascending: true });

  if (error) throw error;
  return data;
};

// ============================================
// DOCUMENT QUERIES
// ============================================

export const getDocuments = async (companyId: string, status?: string) => {
  let query = supabase
    .from('documents')
    .select('*')
    .eq('company_id', companyId)
    .order('uploaded_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const uploadDocument = async (documentData: Database['public']['Tables']['documents']['Insert']) => {
  const { data, error } = await supabase
    .from('documents')
    .insert(documentData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateDocumentStatus = async (
  documentId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected',
  additionalData?: Partial<Database['public']['Tables']['documents']['Update']>
) => {
  const { data, error } = await supabase
    .from('documents')
    .update({ status, ...additionalData })
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// CONVERSATION QUERIES
// ============================================

export const getConversationHistory = async (userId: string, sessionId: string, limit: number = 10) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.reverse(); // Return in chronological order
};

export const saveMessage = async (messageData: Database['public']['Tables']['conversations']['Insert']) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert(messageData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// FAQ QUERIES
// ============================================

export const searchFAQ = async (keywords: string[]) => {
  const { data, error } = await supabase
    .from('faq_content')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error) throw error;

  // Simple keyword matching (can be enhanced with vector search later)
  const filtered = data.filter(faq => {
    const faqKeywords = faq.keywords || [];
    return keywords.some(keyword =>
      faqKeywords.some(faqKeyword =>
        faqKeyword.toLowerCase().includes(keyword.toLowerCase())
      ) ||
      faq.question.toLowerCase().includes(keyword.toLowerCase()) ||
      faq.answer.toLowerCase().includes(keyword.toLowerCase())
    );
  });

  return filtered;
};

export const getFAQByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('faq_content')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error) throw error;
  return data;
};

// ============================================
// ESCALATION QUERIES
// ============================================

export const createEscalation = async (escalationData: Database['public']['Tables']['escalations']['Insert']) => {
  const { data, error } = await supabase
    .from('escalations')
    .insert(escalationData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getEscalations = async (companyId: string, status?: string) => {
  let query = supabase
    .from('escalations')
    .select('*, users!escalations_user_id_fkey(full_name, phone_number)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const updateEscalation = async (
  escalationId: string,
  updateData: Database['public']['Tables']['escalations']['Update']
) => {
  const { data, error } = await supabase
    .from('escalations')
    .update(updateData)
    .eq('id', escalationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// ADMIN QUERIES
// ============================================

export const getPendingDocuments = async () => {
  const { data, error } = await supabase
    .from('documents')
    .select('*, companies(name), users!documents_uploaded_by_fkey(full_name)')
    .in('status', ['pending', 'processing'])
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getOpenEscalations = async () => {
  const { data, error } = await supabase
    .from('escalations')
    .select('*, companies(name), users!escalations_user_id_fkey(full_name, phone_number)')
    .in('status', ['open', 'in_progress'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
