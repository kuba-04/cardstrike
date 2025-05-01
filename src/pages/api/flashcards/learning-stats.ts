import type { APIRoute } from "astro";
import { FlashcardsLearningService } from "../../../lib/services/flashcards-learning.service";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize service and get learning stats
    const learningService = new FlashcardsLearningService(locals.supabase);
    const stats = await learningService.getLearningStats(user.id);

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/flashcards/learning-stats:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Unauthorized") ? 401 : 500;

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}; 