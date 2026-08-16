/**
 * Supabase client initialization for SERVER-SIDE use only.
 * This file uses process.env which is only available in Node.js environments.
 * Do NOT import this in frontend (src/components/) code.
 * For frontend Supabase access, use the API endpoints in server.ts instead.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Server-side client with service_role key (full access, bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Server-side client with anon key (respects Row Level Security)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
