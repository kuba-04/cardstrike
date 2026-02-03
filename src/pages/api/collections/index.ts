import type { APIRoute } from "astro";
import { CollectionsService } from "../../../lib/services/collections.service";

export const prerender = false;

/**
 * GET /api/collections - List all collections with stats
 */
export const GET: APIRoute = async ({ locals }) => {
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

    // Initialize service and list collections
    const collectionsService = new CollectionsService(locals.supabase);
    const result = await collectionsService.listCollections(user.id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/collections:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Unauthorized") ? 401 : 500;

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST /api/collections - Create a new collection
 */
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

    // Parse request body
    const body = await request.json();

    // Initialize service and create collection
    const collectionsService = new CollectionsService(locals.supabase);
    const result = await collectionsService.createCollection(user.id, body);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/collections:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    let status = 500;

    if (errorMessage.includes("Unauthorized")) {
      status = 401;
    } else if (errorMessage.includes("Invalid input") || errorMessage.includes("already exists")) {
      status = 400;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
