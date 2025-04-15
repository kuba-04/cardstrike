import type { APIRoute } from 'astro';
import { FlashcardsService } from '../../../lib/services/flashcards.service';
import type { GenerateFlashcardCommand } from '../../../types';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get supabase client from context
    const supabase = locals.supabase;

    // Check if user is authenticated
    let userId: string = '';
    if (!locals.user?.id) {
      console.error('User unauthenticated');
      userId = crypto.randomUUID();
      // return new Response(JSON.stringify({ error: 'Authentication required' }), {
      //   status: 401,
      //   headers: { 'Content-Type': 'application/json' }
      // });
    } else {
      console.error('User authenticated');
      userId = locals.user.id;
    }

    // Parse request body
    const body = await request.json() as GenerateFlashcardCommand;
    
    // Initialize service and generate flashcards
    const flashcardsService = new FlashcardsService(supabase);
    const result = await flashcardsService.generateFlashcards(userId, body);

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