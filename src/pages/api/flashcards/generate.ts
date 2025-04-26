import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import type { GenerateFlashcardCommand, GenerateFlashcardResponseDTO } from "../../../types";
import { OpenRouterProviderError } from "../../../lib/services/openrouter.service";
import { v4 as uuidv4 } from "uuid";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    // Parse request body
    const body = (await request.json()) as GenerateFlashcardCommand;

    // Handle the demo mode for unauthorized users
    if (authError || !user) {
      // Initialize service for demo generation (no user ID or database storage)
      const flashcardsService = new FlashcardsService(locals.supabase);

      try {
        // Generate flashcards without storing to database
        const candidates = await flashcardsService.generateFlashcardsForDemo(body.source_text);

        // Return a response with a temporary generation ID for the frontend
        return new Response(
          JSON.stringify({
            generation_id: uuidv4(), // Temporary ID, not stored in database
            candidates,
          } as GenerateFlashcardResponseDTO),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (demoError) {
        throw demoError;
      }
    }

    // For authenticated users, proceed with normal flow
    const flashcardsService = new FlashcardsService(locals.supabase);
    const result = await flashcardsService.generateFlashcards(body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating flashcards:", error);

    let errorMessage = "Internal server error";
    let status = 500;

    if (error instanceof OpenRouterProviderError) {
      errorMessage = `The AI service (${error.providerName}) ${error.code === 429 ? "is currently at capacity" : "encountered an error"}. Please try again later.`;
      status = error.code;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      status = error.message.includes("Invalid input") ? 400 : error.message.includes("Unauthorized") ? 401 : 500;
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        code: status,
        provider: error instanceof OpenRouterProviderError ? error.providerName : undefined,
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
