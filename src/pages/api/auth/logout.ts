import type { APIRoute } from "astro";
import { createSupabaseServerClient } from '@/db/supabase.client';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const supabase = createSupabaseServerClient({
      headers: request.headers,
      cookies: {
        get: (name) => cookies.get(name)?.value,
        set: (name, value, options) => cookies.set(name, value, options),
      },
    });

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to logout", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}; 