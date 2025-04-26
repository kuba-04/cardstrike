import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "@/db/supabase.client";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const supabase = createSupabaseServerClient({
      headers: request.headers,
      cookies: {
        get: (name) => cookies.get(name)?.value,
        set: (name, value, options) => cookies.set(name, value, options),
      },
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("/auth/reset-password", request.url).toString(),
    });

    if (error) {
      if (error.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), { status: 429 });
      }
      throw error;
    }

    return new Response(JSON.stringify({ message: "Password reset instructions sent" }), { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 400 }
    );
  }
};
