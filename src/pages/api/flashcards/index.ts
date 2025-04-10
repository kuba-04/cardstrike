import type { APIRoute } from 'astro'
import { z } from 'zod'
import { FlashcardsService, MOCK_USER_ID } from '../../../lib/services/flashcards.service'

// Input validation schemas
const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  filter: z.enum(['ai', 'manual']).optional(),
  sort: z.enum(['created_at']).optional()
})

const CreateFlashcardSchema = z.object({
  front_text: z.string().min(1).max(1000),
  back_text: z.string().min(1).max(1000)
})

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Parse query parameters
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams)

    // Initialize service and list flashcards
    const flashcardsService = new FlashcardsService(locals.supabase)
    const result = await flashcardsService.listFlashcards(MOCK_USER_ID, {
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 20,
      filter: params.filter as 'ai' | 'manual' | undefined,
      sort: params.sort as 'created_at' | undefined
    })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in GET /api/flashcards:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const status = errorMessage.includes('Invalid input') ? 400 : 500
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json()

    // Initialize service and create flashcard
    const flashcardsService = new FlashcardsService(locals.supabase)
    const result = await flashcardsService.createFlashcard(MOCK_USER_ID, body)

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in POST /api/flashcards:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const status = errorMessage.includes('Invalid input') ? 400 : 500
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 