import type { APIRoute } from 'astro';
import { FlashcardsService } from '@/lib/services/flashcards.service';

export const prerender = false;

export const PUT: APIRoute = async ({ params, locals }) => {
  try {
    const { candidate_id } = params;

    if (!candidate_id) {
      return new Response(JSON.stringify({ error: 'Missing candidate ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize service and accept candidate
    const flashcardsService = new FlashcardsService(locals.supabase);
    const result = await flashcardsService.rejectCandidate(candidate_id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in PUT /api/flashcards/candidates/[candidate_id]/reject:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('Invalid input') ? 400 : 
                  errorMessage.includes('not found') ? 404 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 