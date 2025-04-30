import type { APIRoute } from "astro";
import { z } from "zod";
import { FlashcardsLearningService } from "../../../lib/services/flashcards-learning.service";

// Input validation schema
const ReviewSchema = z.object({
  id: z.number().int().positive(),
  grade: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
});

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

    // Parse and validate request body
    const body = await request.json();
    const validatedBody = ReviewSchema.parse(body);

    // Initialize service and record review
    const learningService = new FlashcardsLearningService(locals.supabase);
    const result = await learningService.recordFlashcardReview(
      user.id, 
      validatedBody.id, 
      validatedBody.grade
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/flashcards/review:", error);

    let status = 500;
    let errorMessage = "Internal server error";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error instanceof z.ZodError) {
        status = 400;
      } else if (errorMessage.includes("Unauthorized")) {
        status = 401;
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}; 