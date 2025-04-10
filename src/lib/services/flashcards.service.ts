import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { GenerateFlashcardCommand, GenerateFlashcardResponseDTO, FlashcardCandidateDTO } from '../../types';

// Validation schema for generation input
export const generateFlashcardSchema = z.object({
  source_text: z.string()
    .min(100, 'Text must be at least 100 characters')
    .max(10000, 'Text cannot exceed 10000 characters')
});

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateFlashcards(command: GenerateFlashcardCommand): Promise<GenerateFlashcardResponseDTO> {
    try {
      // Validate input
      generateFlashcardSchema.parse(command);

      // TODO: Replace with actual AI service call
      // For now, we'll mock the AI response with a simple example
      const mockCandidates: FlashcardCandidateDTO[] = [{
        candidate_id: crypto.randomUUID(),
        front_text: "What is the capital of France?",
        back_text: "Paris",
        status: 'pending'
      }];

      // Create generation record in database
      const { data: generation, error } = await this.supabase
        .from('generations')
        .insert({
          source_text: command.source_text,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create generation record: ${error.message}`);
      }

      // Store candidates in database
      const { error: candidatesError } = await this.supabase
        .from('flashcard_candidates')
        .insert(
          mockCandidates.map(candidate => ({
            id: candidate.candidate_id,
            generation_id: generation.id,
            front_content: candidate.front_text,
            back_content: candidate.back_text,
            status: candidate.status
          }))
        );

      if (candidatesError) {
        throw new Error(`Failed to store flashcard candidates: ${candidatesError.message}`);
      }

      return {
        generation_id: generation.id,
        candidates: mockCandidates
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors[0].message}`);
      }
      throw error;
    }
  }
} 