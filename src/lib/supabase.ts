import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Server-side client with service_role key (full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Client-side safe client (respects Row Level Security)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
