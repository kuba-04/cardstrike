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

    // Get optional collection_id from query params
    const url = new URL(request.url);
    const collectionId = url.searchParams.get("collection_id");

    // Initialize service and get due flashcards
    const learningService = new FlashcardsLearningService(locals.supabase);
    
    // Initialize any flashcards that don't have SuperMemo data
    await learningService.initializeFlashcardsForLearning(user.id, collectionId || undefined);
    
    // Get flashcards due for review
    const result = await learningService.getDueFlashcards(user.id, collectionId || undefined);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/flashcards/due:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Unauthorized") ? 401 : 500;

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}; 