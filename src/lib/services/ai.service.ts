import type { FlashcardCandidateDTO } from '../../types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

export interface AIServiceResponse {
  candidates: FlashcardCandidateDTO[];
}

export class AIService {
  constructor(private readonly supabase?: SupabaseClient) {}

  /**
   * Generates flashcard candidates from the provided text.
   * Currently returns mock data, but will be replaced with actual AI service integration.
   */
  async generateFlashcardCandidates(sourceText: string): Promise<AIServiceResponse> {
    // TODO: Replace with actual AI service integration
    // Mock implementation for development
    const mockCandidates: FlashcardCandidateDTO[] = [
      {
        candidate_id: crypto.randomUUID(),
        front_text: "What is the capital of France?",
        back_text: "Paris",
        status: 'pending'
      },
      {
        candidate_id: crypto.randomUUID(),
        front_text: "Which is the largest planet in our solar system?",
        back_text: "Jupiter",
        status: 'pending'
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      candidates: mockCandidates
    };
  }

  /**
   * Logs AI service errors to the generation_error_logs table
   */
  async logError(error: Error, userId: string, generationId: string): Promise<void> {
    if (!this.supabase) {
      console.error('AI Service Error (no database connection):', {
        userId,
        generationId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Generate error hash using MD5 for error deduplication
    const errorHash = createHash('md5')
      .update(error.message)
      .digest('hex');

    const { error: dbError } = await this.supabase
      .from('generation_error_logs')
      .insert({
        user_id: userId,
        generation_id: generationId,
        error_message: error.message,
        error_hash: errorHash,
        error_stack: error.stack || null,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Failed to log AI service error:', dbError);
    }
  }
} 