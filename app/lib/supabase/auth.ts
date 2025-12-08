import { supabase } from './client';

// ============================================
// AUTHENTICATION UTILITIES
// ============================================

/**
 * Sign in with phone number (password-based, not OTP)
 * Phone number is used as the username/identifier
 */
export const signInWithPhone = async (phoneNumber: string, password: string) => {
  // Normalize phone number format
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  const { data, error } = await supabase.auth.signInWithPassword({
    phone: normalizedPhone,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Sign up with phone number and password
 * Creates both an auth user and a user record in the database
 */
export const signUpWithPhone = async (
  phoneNumber: string,
  password: string,
  userData: {
    full_name: string;
    email?: string;
    company_name: string;
    company_details?: {
      address?: string;
      industry?: string;
    };
  }
) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    phone: normalizedPhone,
    password,
    options: {
      data: {
        full_name: userData.full_name,
        email: userData.email,
      },
    },
  });

  if (authError) throw authError;

  // 2. Create company record
  const { data: companyData, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: userData.company_name,
      phone_number: normalizedPhone,
      email: userData.email,
      address: userData.company_details?.address,
      industry: userData.company_details?.industry,
    })
    .select()
    .single();

  if (companyError) {
    // Rollback auth user if company creation fails
    await supabase.auth.admin.deleteUser(authData.user!.id);
    throw companyError;
  }

  // 3. Create user record linked to company
  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user!.id,
      company_id: companyData.id,
      phone_number: normalizedPhone,
      full_name: userData.full_name,
      email: userData.email,
      role: 'client', // Default role is client
    })
    .select()
    .single();

  if (userError) {
    // Rollback company and auth user if user creation fails
    await supabase.from('companies').delete().eq('id', companyData.id);
    await supabase.auth.admin.deleteUser(authData.user!.id);
    throw userError;
  }

  return {
    auth: authData,
    user: userRecord,
    company: companyData,
  };
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get current session
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

/**
 * Get current user with full profile
 */
export const getCurrentUserProfile = async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return null;

  // Get user profile with company info
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;

  return {
    auth: user,
    profile,
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return !!session;
};

/**
 * Check if user is admin
 */
export const isAdmin = async (): Promise<boolean> => {
  const profile = await getCurrentUserProfile();
  return profile?.profile?.role === 'admin';
};

/**
 * Reset password (send reset link to phone/email)
 */
export const resetPassword = async (phoneNumber: string) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedPhone);
  if (error) throw error;
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: {
    full_name?: string;
    email?: string;
  }
) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Normalize phone number to E.164 format
 * Supports Singapore (+65) and US/Canada (+1) formats
 * Examples:
 *   9123 4567 -> +6591234567 (Singapore)
 *   (415) 555-1001 -> +14155551001 (US/Canada)
 */
export const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If already has + prefix, return as is
  if (phone.startsWith('+')) {
    return phone;
  }

  // Singapore: 8 digits -> +65XXXXXXXX
  if (digits.length === 8) {
    return `+65${digits}`;
  }

  // Singapore with country code: 65XXXXXXXX -> +65XXXXXXXX
  if (digits.length === 10 && digits.startsWith('65')) {
    return `+${digits}`;
  }

  // US/Canada: 10 digits -> +1XXXXXXXXXX
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // US/Canada with country code: 1XXXXXXXXXX -> +1XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // Default: assume it's already in correct format
  return `+${digits}`;
};

/**
 * Format phone number for display
 * Examples:
 *   +6591234567 -> +65 9123 4567 (Singapore)
 *   +14155551001 -> (415) 555-1001 (US/Canada)
 */
export const formatPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');

  // Format Singapore numbers: +65 XXXX XXXX
  if (digits.length === 10 && digits.startsWith('65')) {
    const firstPart = digits.slice(2, 6);
    const secondPart = digits.slice(6);
    return `+65 ${firstPart} ${secondPart}`;
  }

  // Format US/Canada numbers: (XXX) XXX-XXXX
  if (digits.length === 11 && digits.startsWith('1')) {
    const areaCode = digits.slice(1, 4);
    const exchange = digits.slice(4, 7);
    const lineNumber = digits.slice(7);
    return `(${areaCode}) ${exchange}-${lineNumber}`;
  }

  return phone;
};

/**
 * Validate phone number format
 * Supports Singapore and US/Canada formats
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');

  // Singapore: 8 digits or 10 digits with country code (65XXXXXXXX)
  if (digits.length === 8 || (digits.length === 10 && digits.startsWith('65'))) {
    return true;
  }

  // US/Canada: 10 digits or 11 digits with country code (1XXXXXXXXXX)
  if (digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))) {
    return true;
  }

  return false;
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  return { valid: true };
};

// ============================================
// AUTH STATE LISTENERS
// ============================================

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Refresh session
 */
export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return data.session;
};
