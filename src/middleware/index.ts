import type { MiddlewareHandler } from "astro";
import { createSupabaseServerClient } from "../db/supabase.client";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  "/",
  "/flashcards",
  "/flashcards/generate",
  "/flashcards/review",
  "/flashcards/review/complete",
  "/flashcards/review/reject",
  "/flashcards/review/update",
  "/api/flashcards/generate",
  // Server-Rendered Astro Pages
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/forgot-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/forgot-password",
];

export const onRequest: MiddlewareHandler = async ({ locals, cookies, url, request, redirect }, next) => {
  const supabase = createSupabaseServerClient({
    headers: request.headers,
    cookies: {
      get: (name: string) => cookies.get(name)?.value,
      set: (name: string, value: string, options: any) => cookies.set(name, value, options),
    },
  });

  // Store supabase client in locals
  locals.supabase = supabase;

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Always set user in locals if available
  if (user) {
    locals.user = {
      email: user.email ?? null,
      id: user.id,
    };
  }

  // Only check protected routes after setting up the user
  if (!PUBLIC_PATHS.includes(url.pathname) && !user) {
    return redirect("/auth/login");
  }

  return next();
};
