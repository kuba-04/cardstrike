import type { APIRoute } from "astro";
import { CollectionsService } from "../../../lib/services/collections.service";

export const prerender = false;

/**
 * GET /api/collections/[id] - Get a specific collection
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

    // Initialize service and get collection
    const collectionsService = new CollectionsService(locals.supabase);
    const collection = await collectionsService.getCollection(user.id, collectionId);

    return new Response(JSON.stringify({ collection }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/collections/[id]:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    let status = 500;

    if (errorMessage.includes("Unauthorized")) {
      status = 401;
    } else if (errorMessage.includes("not found")) {
      status = 404;
    } else if (errorMessage.includes("Invalid")) {
      status = 400;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * PATCH /api/collections/[id] - Update a collection
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
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

    // Parse request body
    const body = await request.json();

    // Initialize service and update collection
    const collectionsService = new CollectionsService(locals.supabase);
    const result = await collectionsService.updateCollection(user.id, collectionId, body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PATCH /api/collections/[id]:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    let status = 500;

    if (errorMessage.includes("Unauthorized")) {
      status = 401;
    } else if (errorMessage.includes("not found")) {
      status = 404;
    } else if (errorMessage.includes("Invalid input") || errorMessage.includes("already exists")) {
      status = 400;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * DELETE /api/collections/[id] - Delete a collection
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
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

    // Initialize service and delete collection
    const collectionsService = new CollectionsService(locals.supabase);
    const result = await collectionsService.deleteCollection(user.id, collectionId);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in DELETE /api/collections/[id]:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    let status = 500;

    if (errorMessage.includes("Unauthorized")) {
      status = 401;
    } else if (errorMessage.includes("not found")) {
      status = 404;
    } else if (errorMessage.includes("Invalid")) {
      status = 400;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
