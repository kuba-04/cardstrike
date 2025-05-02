import { createBrowserClient, createServerClient as createClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient as Client } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export const cookieOptions: CookieOptions = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

// Helper function to check if we're in the browser
const isBrowser = () => {
  return typeof window !== "undefined" && typeof document !== "undefined";
};

export function getSupabaseClient(context?: {
  headers: Headers;
  cookies: {
    get: (name: string) => string | undefined;
    set: (name: string, value: string, options: CookieOptions) => void;
  };
}): Client<Database> {
  if (isBrowser()) {
    return createSupabaseBrowserClient();
  }

  if (!context) {
    throw new Error("Context is required for server-side Supabase client");
  }

  return createSupabaseServerClient(context);
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );
}

export function createSupabaseServerClient(context: {
  headers: Headers;
  cookies: {
    get: (name: string) => string | undefined;
    set: (name: string, value: string, options: CookieOptions) => void;
  };
}) {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return context.cookies.get(name) || '';
        },
        set(name, value, options) {
          context.cookies.set(name, value, options);
        },
        remove(name, options) {
          context.cookies.set(name, "", { ...options, maxAge: 0 });
        }
      }
    }
  );
}

export type SupabaseClient = Client<Database>;
