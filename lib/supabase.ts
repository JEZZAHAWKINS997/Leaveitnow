import { createClient } from '@supabase/supabase-js';

// Helper to safely access env vars in various environments (Vite, CRA, etc.)
const getEnv = (key: string) => {
  let val = '';
  try {
    // Try Vite way
    if (import.meta && (import.meta as any).env) {
      val = (import.meta as any).env[key];
    }
  } catch (e) {}

  // Try Process way (fallback for Node/CRA/Other)
  if (!val) {
    try {
      if (typeof process !== 'undefined' && (process as any).env) {
        val = (process as any).env[key];
      }
    } catch (e) {}
  }
  return val;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Log error if keys are missing to help debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase keys are missing! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
  );
}

// Initialize client with fallback to avoid crash during initialization
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);