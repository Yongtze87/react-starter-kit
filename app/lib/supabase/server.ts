import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * SERVER-SIDE ONLY - DO NOT IMPORT IN CLIENT COMPONENTS
 *
 * This file contains Supabase client with service role key
 * which bypasses Row Level Security (RLS) and has full database access.
 *
 * ONLY use in API routes and server-side code.
 */

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

/**
 * Create a Supabase client with service role key for server-side operations
 *
 * ⚠️ WARNING: This client has FULL database access and bypasses RLS
 * Only use for:
 * - Admin operations
 * - Server-side data processing
 * - Bypassing RLS when necessary
 *
 * NEVER expose this to client-side code
 */
export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Get a singleton instance of the server Supabase client
 */
let serverClient: ReturnType<typeof createClient<Database>> | null = null;

export const getServerSupabaseClient = () => {
  if (!serverClient) {
    serverClient = createServerSupabaseClient();
  }
  return serverClient;
};
