import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { GenerateFlashcardCommand, GenerateFlashcardResponseDTO } from '../../types';
import { AIService } from './ai.service';

// Validation schema for generation input
export const generateFlashcardSchema = z.object({
  source_text: z.string()
    .min(100, 'Text must be at least 100 characters')
    .max(10000, 'Text cannot exceed 10000 characters')
});

// Hardcoded user ID for development
const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

export class FlashcardsService {
  private aiService: AIService;

  constructor(private readonly supabase: SupabaseClient) {
    this.aiService = new AIService(supabase);
  }

  async generateFlashcards(command: GenerateFlashcardCommand): Promise<GenerateFlashcardResponseDTO> {
    try {
      // Validate input
      generateFlashcardSchema.parse(command);

      // Create generation record in database
      const { data: generation, error } = await this.supabase
        .from('generations')
        .insert({
          source_text: command.source_text,
          status: 'pending',
          user_id: MOCK_USER_ID
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create generation record: ${error.message}`);
      }

      try {
        // Generate flashcard candidates using AI service
        const { candidates } = await this.aiService.generateFlashcardCandidates(command.source_text);

        // Store candidates in database
        const { error: candidatesError } = await this.supabase
          .from('flashcard_candidates')
          .insert(
            candidates.map(candidate => ({
              id: candidate.candidate_id,
              generation_id: generation.id,
              front_content: candidate.front_text,
              back_content: candidate.back_text,
              status: candidate.status,
              user_id: MOCK_USER_ID
            }))
          );

        if (candidatesError) {
          throw new Error(`Failed to store flashcard candidates: ${candidatesError.message}`);
        }

        return {
          generation_id: generation.id,
          candidates
        };
      } catch (aiError) {
        // Log AI service error
        await this.aiService.logError(
          aiError instanceof Error ? aiError : new Error('Unknown AI service error'),
          MOCK_USER_ID,
          generation.id
        );
        throw aiError;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors[0].message}`);
      }
      throw error;
    }
  }
} 