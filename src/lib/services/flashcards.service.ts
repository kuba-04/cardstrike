import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  GenerateFlashcardCommand, 
  GenerateFlashcardResponseDTO, 
  UpdateFlashcardCandidateCommand,
  UpdateFlashcardCandidateResponseDTO 
} from '../../types';
import { AIService } from './ai.service';

// Validation schemas
export const generateFlashcardSchema = z.object({
  source_text: z.string()
    .min(100, 'Text must be at least 100 characters')
    .max(10000, 'Text cannot exceed 10000 characters')
});

export const updateCandidateSchema = z.object({
  front_text: z.string().min(1, 'Front text cannot be empty'),
  back_text: z.string().min(1, 'Back text cannot be empty'),
  accept: z.boolean()
});

// Hardcoded user ID for development
const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

// Default AI model configuration
const DEFAULT_MODEL = 'anthropic/claude-3-opus-20240229';

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
          user_id: MOCK_USER_ID,
          model: DEFAULT_MODEL,
          generated_count: 0,  // Will be updated after generation
          accepted_unedited_count: 0,
          accepted_edited_count: 0,
          generation_duration: 0  // Will be updated after generation
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create generation record: ${error.message}`);
      }

      try {
        const startTime = Date.now();
        
        // Generate flashcard candidates using AI service
        const { candidates } = await this.aiService.generateFlashcardCandidates(command.source_text);
        
        const generationDuration = Date.now() - startTime;

        // Update generation record with results
        await this.supabase
          .from('generations')
          .update({
            status: 'completed',
            generated_count: candidates.length,
            generation_duration: generationDuration
          })
          .eq('id', generation.id);

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
        // Update generation status to failed
        await this.supabase
          .from('generations')
          .update({
            status: 'failed'
          })
          .eq('id', generation.id);

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

  async updateCandidate(
    candidateId: string, 
    command: UpdateFlashcardCandidateCommand
  ): Promise<UpdateFlashcardCandidateResponseDTO> {
    try {
      // Validate input
      updateCandidateSchema.parse(command);

      // Get the candidate to verify it exists and belongs to the user
      const { data: candidate, error: fetchError } = await this.supabase
        .from('flashcard_candidates')
        .select('id, generation_id')
        .eq('id', candidateId)
        .eq('user_id', MOCK_USER_ID)
        .single();

      if (fetchError || !candidate) {
        throw new Error('Flashcard candidate not found');
      }

      // Update the candidate
      const { error: updateError } = await this.supabase
        .from('flashcard_candidates')
        .update({
          front_content: command.front_text,
          back_content: command.back_text,
          status: command.accept ? 'accepted' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', candidateId)
        .eq('user_id', MOCK_USER_ID);

      if (updateError) {
        throw new Error(`Failed to update flashcard candidate: ${updateError.message}`);
      }

      return {
        message: 'Candidate updated successfully',
        candidate: {
          candidate_id: candidateId,
          front_text: command.front_text,
          back_text: command.back_text
        }
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors[0].message}`);
      }
      throw error;
    }
  }
} 