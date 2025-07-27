// lib/supabase-browser.ts
'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

let supabaseClient: SupabaseClient | null = null;

const createSupabaseClient = async () => {
  if (supabaseClient) return supabaseClient;

  // Check if we're in a client environment
  if (typeof window === 'undefined') {
    // Server-side: create client without AsyncStorage
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  } else {
    // Client-side: import AsyncStorage and create client with persistence
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;

      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
    } catch (error) {
      console.warn('Failed to import AsyncStorage, creating client without persistence:', error);
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
    }
  }

  return supabaseClient;
};

// Export a promise that resolves to the client
export const getSupabaseClient = createSupabaseClient;

// For backward compatibility, export a client that will be initialized
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Initialize the proper client when in browser environment
if (typeof window !== 'undefined') {
  createSupabaseClient().then((client) => {
    // Replace the basic client with the properly configured one
    Object.assign(supabase, client);
  });
}
