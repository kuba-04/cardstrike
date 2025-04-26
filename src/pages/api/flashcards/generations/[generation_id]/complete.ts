import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../../../lib/services/flashcards.service";

export const prerender = false;

export const PUT: APIRoute = async ({ params, locals }) => {
  try {
    const { generation_id } = params;

    if (!generation_id) {
      return new Response(JSON.stringify({ error: "Missing generation ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    // Special handling for demo mode (unauthenticated users)
    if (authError || !user) {
      // For demo users, we don't store anything but return a success response
      return new Response(
        JSON.stringify({
          message: "Demo generation review completed",
          stats: {
            total_candidates: 0,
            accepted: 0,
            rejected: 0,
          },
          saved_flashcards: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // For authenticated users, proceed with normal flow
    const flashcardsService = new FlashcardsService(locals.supabase);
    const result = await flashcardsService.completeGeneration(user.id, generation_id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/flashcards/generations/[generation_id]/complete:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Invalid")
      ? 400
      : errorMessage.includes("not found")
        ? 404
        : errorMessage.includes("Unauthorized")
          ? 401
          : 500;

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
