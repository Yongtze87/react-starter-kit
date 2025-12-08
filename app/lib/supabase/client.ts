import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_ANON_KEY');
}

/**
 * CLIENT-SIDE ONLY Supabase client
 *
 * This client uses the anonymous key and respects Row Level Security (RLS).
 * Safe to use in client-side components.
 *
 * For server-side operations requiring admin access,
 * use createServerSupabaseClient from './server.ts' instead.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export default supabase;
