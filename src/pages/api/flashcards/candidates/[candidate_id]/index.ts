import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../../../lib/services/flashcards.service";
import type { UpdateFlashcardCandidateCommand } from "../../../../../types";

export const prerender = false;

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const { candidate_id } = params;

    if (!candidate_id) {
      return new Response(JSON.stringify({ error: "Missing candidate ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = (await request.json()) as UpdateFlashcardCandidateCommand;

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
          message: "Demo candidate updated successfully",
          candidate: {
            candidate_id,
            front_text: body.front_text,
            back_text: body.back_text,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // For authenticated users, proceed with normal flow
    const flashcardsService = new FlashcardsService(locals.supabase);
    const result = await flashcardsService.updateCandidate(user.id, candidate_id, body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/flashcards/candidates/[candidate_id]:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Invalid input")
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
