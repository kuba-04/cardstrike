import type { APIRoute } from "astro";
import { FlashcardsLearningService } from "../../../lib/services/flashcards-learning.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
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

    // Initialize service and initialize flashcards for learning
    const learningService = new FlashcardsLearningService(locals.supabase);
    const result = await learningService.initializeFlashcardsForLearning(user.id);

    return new Response(JSON.stringify({ 
      message: `Initialized ${result.count} flashcards for learning`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/flashcards/initialize-learning:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Unauthorized") ? 401 : 500;

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}; 