import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Create Supabase server instance with cookie handling
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  return createServerClient<Database, 'public'>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
      cookies: {
        set: (name: string, value: string, options?: { maxAge?: number }) => {
          context.cookies.set(name, value, {
            maxAge: options?.maxAge ?? 60 * 60 * 8, // 8 hours
            path: '/',
            sameSite: 'lax',
          });
        },
        get: (name: string) => {
          return context.cookies.get(name)?.value;
        },
        remove: (name: string) => {
          context.cookies.delete(name, {
            path: '/',
          });
        },
      },
    },
  );
};

// Client-side Supabase instance
export const supabaseClient = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  }
); 