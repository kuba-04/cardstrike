import type { APIRoute } from "astro";
import { CollectionsService } from "../../../../lib/services/collections.service";

export const prerender = false;

/**
 * GET /api/collections/[id]/stats - Get collection statistics
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const collectionId = params.id;

    if (!collectionId) {
      return new Response(JSON.stringify({ error: "Collection ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    // Initialize service and get stats
    const collectionsService = new CollectionsService(locals.supabase);
    const stats = await collectionsService.getCollectionStats(user.id, collectionId);

    return new Response(JSON.stringify({ stats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/collections/[id]/stats:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    let status = 500;

    if (errorMessage.includes("Unauthorized")) {
      status = 401;
    } else if (errorMessage.includes("Invalid")) {
      status = 400;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
