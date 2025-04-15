import type { APIRoute } from 'astro'
import { FlashcardsService } from '../../../lib/services/flashcards.service'

export const prerender = false

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing flashcard ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize service and get flashcard
    const flashcardsService = new FlashcardsService(locals.supabase)
    const result = await flashcardsService.getFlashcard(user.id, id)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in GET /api/flashcards/[id]:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const status = errorMessage.includes('Invalid') ? 400 : 
                  errorMessage.includes('not found') ? 404 :
                  errorMessage.includes('Unauthorized') ? 401 : 500
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing flashcard ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json()

    // Initialize service and update flashcard
    const flashcardsService = new FlashcardsService(locals.supabase)
    const result = await flashcardsService.updateFlashcard(user.id, id, body)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in PUT /api/flashcards/[id]:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const status = errorMessage.includes('Invalid') ? 400 : 
                  errorMessage.includes('not found') ? 404 :
                  errorMessage.includes('Unauthorized') ? 401 : 500
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing flashcard ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize service and delete flashcard
    const flashcardsService = new FlashcardsService(locals.supabase)
    const result = await flashcardsService.deleteFlashcard(user.id, id)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in DELETE /api/flashcards/[id]:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const status = errorMessage.includes('Invalid') ? 400 : 
                  errorMessage.includes('not found') ? 404 :
                  errorMessage.includes('Unauthorized') ? 401 : 500
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 