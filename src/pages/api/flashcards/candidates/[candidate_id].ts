import type { APIRoute } from 'astro';
import { FlashcardsService } from '../../../../lib/services/flashcards.service';
import type { UpdateFlashcardCandidateCommand } from '../../../../types';

export const prerender = false;

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const candidateId = params.candidate_id;
    if (!candidateId) {
      return new Response(JSON.stringify({ error: 'Candidate ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json() as UpdateFlashcardCandidateCommand;
    
    // Initialize service and update candidate
    const flashcardsService = new FlashcardsService(locals.supabase);
    const result = await flashcardsService.updateCandidate(candidateId, body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating flashcard candidate:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('not found') ? 404 :
                  errorMessage.includes('Invalid input') ? 400 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 