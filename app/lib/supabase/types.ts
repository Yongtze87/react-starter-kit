// TypeScript types for Supabase Database Schema
// Generated from: database/migrations/001_initial_schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          phone_number: string
          email: string | null
          address: string | null
          industry: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone_number: string
          email?: string | null
          address?: string | null
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone_number?: string
          email?: string | null
          address?: string | null
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string
          phone_number: string
          full_name: string | null
          email: string | null
          role: 'client' | 'admin'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          phone_number: string
          full_name?: string | null
          email?: string | null
          role: 'client' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          phone_number?: string
          full_name?: string | null
          email?: string | null
          role?: 'client' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      financial_transactions: {
        Row: {
          id: string
          company_id: string
          transaction_date: string
          description: string
          amount: number
          transaction_type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity'
          category: string
          subcategory: string | null
          account_code: string | null
          vendor_customer: string | null
          reference_number: string | null
          notes: string | null
          fiscal_year: number
          fiscal_quarter: number | null
          fiscal_month: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          transaction_date: string
          description: string
          amount: number
          transaction_type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity'
          category: string
          subcategory?: string | null
          account_code?: string | null
          vendor_customer?: string | null
          reference_number?: string | null
          notes?: string | null
          fiscal_year: number
          fiscal_quarter?: number | null
          fiscal_month?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          transaction_date?: string
          description?: string
          amount?: number
          transaction_type?: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity'
          category?: string
          subcategory?: string | null
          account_code?: string | null
          vendor_customer?: string | null
          reference_number?: string | null
          notes?: string | null
          fiscal_year?: number
          fiscal_quarter?: number | null
          fiscal_month?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          company_id: string
          uploaded_by: string | null
          document_name: string
          document_type: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected'
          extracted_data: Json | null
          generated_entries_url: string | null
          admin_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          uploaded_at: string
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          uploaded_by?: string | null
          document_name: string
          document_type: string
          file_url: string
          file_size?: number | null
          mime_type?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected'
          extracted_data?: Json | null
          generated_entries_url?: string | null
          admin_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          uploaded_at?: string
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          uploaded_by?: string | null
          document_name?: string
          document_type?: string
          file_url?: string
          file_size?: number | null
          mime_type?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected'
          extracted_data?: Json | null
          generated_entries_url?: string | null
          admin_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          uploaded_at?: string
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          company_id: string
          message_role: 'user' | 'assistant' | 'system'
          message_content: string
          message_metadata: Json | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          message_role: 'user' | 'assistant' | 'system'
          message_content: string
          message_metadata?: Json | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          message_role?: 'user' | 'assistant' | 'system'
          message_content?: string
          message_metadata?: Json | null
          session_id?: string | null
          created_at?: string
        }
      }
      faq_content: {
        Row: {
          id: string
          category: string
          question: string
          answer: string
          keywords: string[] | null
          embedding: number[] | null
          priority: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          question: string
          answer: string
          keywords?: string[] | null
          embedding?: number[] | null
          priority?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          question?: string
          answer?: string
          keywords?: string[] | null
          embedding?: number[] | null
          priority?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      escalations: {
        Row: {
          id: string
          company_id: string
          user_id: string
          query_text: string
          ai_confidence: number | null
          reason: string
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          assigned_to: string | null
          admin_response: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          query_text: string
          ai_confidence?: number | null
          reason: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          assigned_to?: string | null
          admin_response?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          query_text?: string
          ai_confidence?: number | null
          reason?: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          assigned_to?: string | null
          admin_response?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      view_profit_loss: {
        Row: {
          company_id: string | null
          fiscal_year: number | null
          fiscal_quarter: number | null
          total_revenue: number | null
          total_expenses: number | null
          net_profit: number | null
        }
      }
      view_document_status: {
        Row: {
          company_id: string | null
          status: string | null
          document_count: number | null
          latest_upload: string | null
        }
      }
    }
    Functions: {
      cleanup_old_conversations: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
