import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";
import { UserService } from "../../../lib/services/user.service";
import { ErrorService, ErrorType } from "../../../lib/services/error.service";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    const supabase = createSupabaseServerClient({
      headers: request.headers,
      cookies: {
        get: (name) => cookies.get(name)?.value,
        set: (name, value, options) => cookies.set(name, value, options),
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login auth error:", error);
      return new Response(JSON.stringify({ 
        error: ErrorService.getUserFriendlyMessage(ErrorType.AUTHENTICATION)
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

    // Ensure user record exists in our database
    const userService = new UserService(supabase);
    await userService.ensureUserExists(data.user);

    return new Response(JSON.stringify({ user: data.user }), {
      status: 200,
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        error: ErrorService.formatError(error)
      }),
      { status: 500 }
    );
  }
};
