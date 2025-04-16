import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../db/supabase.client';
import { UserService } from '../../../lib/services/user.service';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password, username } = registerSchema.parse(body);

    const supabase = createSupabaseServerClient({
      headers: request.headers,
      cookies: {
        get: (name) => cookies.get(name)?.value,
        set: (name, value, options) => cookies.set(name, value, options),
      },
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    if (!data.user) {
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        status: 400,
      });
    }

    // Create user record in our database
    const userService = new UserService(supabase);
    await userService.ensureUserExists(data.user);

    return new Response(JSON.stringify({ user: data.user }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      { status: 500 }
    );
  }
}; 