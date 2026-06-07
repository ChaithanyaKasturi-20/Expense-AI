import { createClient } from '@supabase/supabase-js';

// Read Supabase environment values from Vite. These values must be provided
// through a local environment file and should never be checked into source.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.local.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist the user's session in the browser so they stay logged in.
    persistSession: true,
    // Detect session information in the URL after OAuth redirects.
    detectSessionInUrl: true,
  },
});
