import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Configure Supabase client with proper session management
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store session in local storage
    storage: localStorage,
    // Automatically refresh token before expiry
    autoRefreshToken: true,
    // Persist session across page refreshes
    persistSession: true,
    // Detect session from URL (for OAuth/magic links)
    detectSessionInUrl: true,
    // Flow type for PKCE authentication
    flowType: 'pkce'
  }
})
