import { createClient } from '@supabase/supabase-js';

// Fallback dummy values to prevent build crashes. You must provide real ones in your env!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
