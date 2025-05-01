import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";
import { UserService } from "../../../lib/services/user.service";
import { ErrorService, ErrorType } from "../../../lib/services/error.service";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
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
      console.error("Supabase auth error:", error);
      const errorType = error.message.includes("already") ? 
        ErrorType.VALIDATION : 
        ErrorType.AUTHENTICATION;
      
      return new Response(JSON.stringify({ 
        error: ErrorService.getUserFriendlyMessage(errorType)
      }), {
        status: 400,
      });
    }

    if (!data.user) {
      return new Response(JSON.stringify({ 
        error: ErrorService.getUserFriendlyMessage(ErrorType.AUTHENTICATION)
      }), {
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
    console.error("Registration error:", error);
    
    // Handle validation errors from zod
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: ErrorService.getUserFriendlyMessage(ErrorType.VALIDATION)
        }),
        { status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({
        error: ErrorService.formatError(error)
      }),
      { status: 500 }
    );
  }
};
