import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "@/db/supabase.client";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { password } = resetPasswordSchema.parse(body);

    const supabase = createSupabaseServerClient({
      headers: request.headers,
      cookies: {
        get: (name) => cookies.get(name)?.value,
        set: (name, value, options) => cookies.set(name, value, options),
      },
    });

    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      if (error.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), { status: 429 });
      }
      throw error;
    }

    // After successful password reset, sign in the user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.user.email!,
      password: password,
    });

    if (signInError) {
      throw signInError;
    }

    return new Response(JSON.stringify({ message: "Password reset successful" }), { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    const status = message.includes("Invalid") || message.includes("expired") ? 400 : 500;

    return new Response(JSON.stringify({ error: message }), { status });
  }
};
