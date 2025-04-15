import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    // Clear the auth cookie
    cookies.delete("sb-auth-token", { 
      path: "/",
    });

    // Sign out from Supabase
    await supabaseClient.auth.signOut();

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