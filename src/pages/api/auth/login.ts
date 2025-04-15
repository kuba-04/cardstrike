import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createSupabaseServerInstance } from '../../../db/supabase.client';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: result.error.issues[0].message 
        }), 
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Initialize Supabase client
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Log the full error for debugging
      console.error('Supabase Auth Error:', {
        message: error.message,
        status: error.status,
        name: error.name
      });

      // Map error messages to user-friendly responses
      let errorMessage = 'Invalid email or password';
      let statusCode = 401;

      switch (error.message) {
        case 'Invalid login credentials':
          errorMessage = 'Invalid email or password';
          break;
        case 'Email not confirmed':
          errorMessage = 'Please verify your email address before logging in';
          break;
        case 'Invalid email or password':
          errorMessage = 'Invalid email or password';
          break;
        default:
          errorMessage = 'An error occurred during login';
          statusCode = 500;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          code: error.message
        }), 
        { status: statusCode }
      );
    }

    // Return success response with user data
    return new Response(
      JSON.stringify({ 
        user: {
          id: data.user.id,
          email: data.user.email,
        }
      }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred during login' 
      }), 
      { status: 500 }
    );
  }
}; 