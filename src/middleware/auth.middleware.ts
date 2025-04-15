import type { MiddlewareHandler, AstroCookies } from 'astro';
import { UserService } from '@/lib/services/user.service';
import { createSupabaseServerInstance } from '@/db/supabase.client';

type MiddlewareContext = {
  cookies: AstroCookies;
  request: Request;
};

export const authMiddleware: MiddlewareHandler = async (context: MiddlewareContext, next) => {
  const supabase = createSupabaseServerInstance({ 
    cookies: context.cookies, 
    headers: context.request.headers 
  });
  const userService = new UserService();

  // Get session from Supabase Auth
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    // Ensure user exists in our custom users table
    try {
      await userService.ensureUserExists(session.user);
    } catch (error) {
      console.error('Failed to sync user:', error);
      // Don't throw here - we want the request to continue even if sync fails
    }
  }

  const response = await next();
  return response;
}; 