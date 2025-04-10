import type { APIRoute } from 'astro';
import { FlashcardsService } from '../../../lib/services/flashcards.service';
import type { GenerateFlashcardCommand } from '../../../types';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get supabase client from context
    const supabase = locals.supabase;
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json() as GenerateFlashcardCommand;
    
    // Initialize service and generate flashcards
    const flashcardsService = new FlashcardsService(supabase);
    const result = await flashcardsService.generateFlashcards(body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('Invalid input') ? 400 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 