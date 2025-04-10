import type { APIRoute } from 'astro';
import { FlashcardsService, MOCK_USER_ID } from '../../../../../lib/services/flashcards.service';

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  try {
    const { generation_id } = params;

    if (!generation_id) {
      return new Response(JSON.stringify({ error: 'Missing generation ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize service and complete generation
    const flashcardsService = new FlashcardsService(locals.supabase);
    const result = await flashcardsService.completeGeneration(MOCK_USER_ID, generation_id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in POST /api/flashcards/generations/[generation_id]/complete:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('Invalid') ? 400 : 
                  errorMessage.includes('not found') ? 404 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 