import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
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
  // TODO: refactor to use cookies from the server
  return createBrowserClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookies: {
      get(key) {
        return document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${key}=`))
          ?.split("=")[1];
      },
      set(key, value, options) {
        document.cookie = `${key}=${value}; Path=${options.path}; SameSite=${options.sameSite}; ${
          options.secure ? "Secure;" : ""
        } ${options.httpOnly ? "HttpOnly;" : ""}`;
      },
      remove(key, options) {
        document.cookie = `${key}=; Max-Age=0; Path=${options.path}; SameSite=${options.sameSite}; ${
          options.secure ? "Secure;" : ""
        } ${options.httpOnly ? "HttpOnly;" : ""}`;
      },
    },
  });
}

export function createSupabaseServerClient(context: {
  headers: Headers;
  cookies: {
    get: (name: string) => string | undefined;
    set: (name: string, value: string, options: CookieOptions) => void;
  };
}) {
  return createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookies: {
      get(name: string) {
        return context.cookies.get(name);
      },
      set(name: string, value: string, options: CookieOptions) {
        context.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        context.cookies.set(name, "", { ...options, maxAge: 0 });
      },
    },
  });
}

export type SupabaseClient = Client<Database>;
