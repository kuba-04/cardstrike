import type { APIRoute } from 'astro';
import { FlashcardsService } from '../../../lib/services/flashcards.service';
import type { GenerateFlashcardCommand } from '../../../types';
import { OpenRouterProviderError } from '../../../lib/services/openrouter.service';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json() as GenerateFlashcardCommand;
    
    // Initialize service and generate flashcards
    const flashcardsService = new FlashcardsService(locals.supabase);
    const result = await flashcardsService.generateFlashcards(body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    
    let errorMessage = 'Internal server error';
    let status = 500;

    if (error instanceof OpenRouterProviderError) {
      errorMessage = `The AI service (${error.providerName}) ${error.code === 429 ? 'is currently at capacity' : 'encountered an error'}. Please try again later.`;
      status = error.code;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      status = error.message.includes('Invalid input') ? 400 : 
               error.message.includes('Unauthorized') ? 401 : 500;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: status,
      provider: error instanceof OpenRouterProviderError ? error.providerName : undefined
    }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 