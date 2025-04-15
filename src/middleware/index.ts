import { sequence } from 'astro/middleware';
import type { MiddlewareHandler } from 'astro';
import { createSupabaseServerInstance } from '../db/supabase.client';
import { authMiddleware } from './auth.middleware';

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/callback',
];

const authProtectionMiddleware: MiddlewareHandler = async ({ locals, cookies, request, redirect }, next) => {
  // Initialize Supabase client with proper cookie handling
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Store Supabase client in locals
  locals.supabase = supabase;

  // Get the current path
  const url = new URL(request.url);
  const isPublicPath = PUBLIC_PATHS.includes(url.pathname);

  // Get the user session
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Store user in locals if authenticated
    locals.user = {
      id: user.id,
      email: user.email ?? null,
    };
  } else if (!isPublicPath) {
    // Redirect to login for protected routes
    return redirect('/auth/login');
  }

  // Continue to the next middleware or route handler
  return next();
};

// Run auth middleware first to sync users, then auth protection middleware
export const onRequest = sequence(authMiddleware, authProtectionMiddleware); 