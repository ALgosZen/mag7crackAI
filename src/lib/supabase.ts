import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Creates a Supabase client that uses the Firebase ID Token for authentication.
 * This allows Supabase to trust the Firebase user via the established Auth Hook.
 */
export const getSupabaseClient = (idToken?: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: idToken ? `Bearer ${idToken}` : '',
      },
    },
  });
};

// Default client for unauthenticated requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
