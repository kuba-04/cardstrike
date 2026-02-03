import type { APIRoute } from "astro";
import { z } from "zod";
import { FlashcardsService } from "../../../lib/services/flashcards.service";

// Input validation schemas
const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  filter: z.enum(["ai", "manual"]).optional(),
  sort: z.enum(["created_at"]).optional(),
  collection_id: z.string().uuid().optional(),
});

const CreateFlashcardSchema = z.object({
  front_text: z.string().min(1).max(1000),
  back_text: z.string().min(1).max(1000),
  collection_id: z.string().uuid().optional().nullable(),
});

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

    // Parse query parameters
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);

    // Validate query parameters
    const validatedParams = QuerySchema.parse({
      page: params.page,
      limit: params.limit,
      filter: params.filter,
      sort: params.sort,
      collection_id: params.collection_id,
    });

    // Initialize service and list flashcards
    const flashcardsService = new FlashcardsService(locals.supabase);
    const result = await flashcardsService.listFlashcards(user.id, validatedParams);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/flashcards:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Invalid input") ? 400 : errorMessage.includes("Unauthorized") ? 401 : 500;

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};

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
    const validatedBody = CreateFlashcardSchema.parse(body);

    // Initialize service and create flashcard
    const flashcardsService = new FlashcardsService(locals.supabase);
    const result = await flashcardsService.createFlashcard(user.id, validatedBody);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/flashcards:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Invalid input") ? 400 : errorMessage.includes("Unauthorized") ? 401 : 500;

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
