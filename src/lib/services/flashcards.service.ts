import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  GenerateFlashcardCommand,
  GenerateFlashcardResponseDTO,
  UpdateFlashcardCandidateCommand,
  UpdateFlashcardCandidateResponseDTO,
  FlashcardDTO,
  GetFlashcardsResponseDTO,
  CreateFlashcardCommand,
  CreateFlashcardResponseDTO,
  UpdateFlashcardCommand,
  UpdateFlashcardResponseDTO,
  DeleteFlashcardResponseDTO,
  CompleteGenerationResponseDTO,
  FlashcardCandidateDTO,
} from "../../types";
import { OpenRouterFlashcardService } from "./openrouter-flashcard.service";
import { UserService } from "./user.service";

// Validation schemas
export const generateFlashcardSchema = z.object({
  source_text: z
    .string()
    .min(100, "Text must be at least 100 characters")
    .max(10000, "Text cannot exceed 10000 characters"),
});

export const updateCandidateSchema = z.object({
  front_text: z.string().min(1, "Front text cannot be empty"),
  back_text: z.string().min(1, "Back text cannot be empty"),
});

export const listFlashcardsSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
  filter: z.enum(["ai", "manual"]).optional(),
  sort: z.enum(["created_at"]).optional(),
});

export const createFlashcardSchema = z.object({
  front_text: z.string().min(1, "Front text cannot be empty").max(1000, "Front text too long"),
  back_text: z.string().min(1, "Back text cannot be empty").max(1000, "Back text too long"),
});

export const updateFlashcardSchema = z.object({
  front_text: z.string().min(1, "Front text cannot be empty").max(1000, "Front text too long"),
  back_text: z.string().min(1, "Back text cannot be empty").max(1000, "Back text too long"),
});

export class FlashcardsService {
  private aiService: OpenRouterFlashcardService;
  private supabase: SupabaseClient<any, "public", any>;
  private userService: UserService;

  constructor(supabase: SupabaseClient<any, "public", any>) {
    this.supabase = supabase;
    this.aiService = new OpenRouterFlashcardService();
    this.userService = new UserService(supabase);
  }

  async generateFlashcards(command: GenerateFlashcardCommand): Promise<GenerateFlashcardResponseDTO> {
    try {
      // Validate input
      generateFlashcardSchema.parse(command);

      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await this.supabase.auth.getUser();
      if (authError) {
        throw new Error("Authentication error");
      }

      // For demo/unauthenticated users, generate a temporary ID
      const userId = user?.id || crypto.randomUUID();

      // Ensure user exists in database if authenticated
      if (user) {
        const dbUser = await this.userService.getUser(userId);
        if (!dbUser) {
          throw new Error("User not found");
        }
      }

      const modelName = this.aiService.modelName;

      // Create generation record in database
      const { data: generation, error } = await this.supabase
        .from("generations")
        .insert({
          source_text: command.source_text,
          status: "pending",
          user_id: userId,
          model: modelName,
          generated_count: 0, // Will be updated after generation
          accepted_unedited_count: 0,
          accepted_edited_count: 0,
          generation_duration: 0, // Will be updated after generation
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(`DB Error: Failed to create generation record: ${error.message}`);
      }

      try {
        const startTime = Date.now();

        // Generate flashcard candidates using OpenRouter service
        const { candidates } = await this.aiService.generateFlashcards(command.source_text);
        const generationDuration = Date.now() - startTime;

        // Update generation record with results
        await this.supabase
          .from("generations")
          .update({
            status: "completed",
            generated_count: candidates.length,
            generation_duration: generationDuration,
          })
          .eq("id", generation.id);

        // Store candidates in database
        const { error: candidatesError } = await this.supabase.from("flashcard_candidates").insert(
          candidates.map((candidate) => ({
            id: candidate.candidate_id,
            generation_id: generation.id,
            front_content: candidate.front_text,
            back_content: candidate.back_text,
            status: candidate.status,
            user_id: userId,
          }))
        );

        if (candidatesError) {
          throw new Error(`Failed to store flashcard candidates: ${candidatesError.message}`);
        }

        return {
          generation_id: generation.id,
          candidates,
        };
      } catch (aiError) {
        // Update generation status to failed
        await this.supabase
          .from("generations")
          .update({
            status: "failed",
            error_message: aiError instanceof Error ? aiError.message : "Unknown error",
          })
          .eq("id", generation.id);

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
    userId: string,
    candidateId: string,
    command: UpdateFlashcardCandidateCommand
  ): Promise<UpdateFlashcardCandidateResponseDTO> {
    try {
      // Validate input
      updateCandidateSchema.parse(command);

      // Get the candidate to verify it exists and belongs to the user
      const { data: candidate, error: fetchError } = await this.supabase
        .from("flashcard_candidates")
        .select("id, generation_id")
        .eq("id", candidateId)
        .eq("user_id", userId)
        .single();

      if (fetchError || !candidate) {
        throw new Error("Flashcard candidate not found");
      }

      // Update the candidate
      const { error: updateError } = await this.supabase
        .from("flashcard_candidates")
        .update({
          front_content: command.front_text,
          back_content: command.back_text,
          status: "edited",
          updated_at: new Date().toISOString(),
        })
        .eq("id", candidateId)
        .eq("user_id", userId);

      if (updateError) {
        throw new Error(`Failed to update flashcard candidate: ${updateError.message}`);
      }

      return {
        message: "Candidate updated successfully",
        candidate: {
          candidate_id: candidateId,
          front_text: command.front_text,
          back_text: command.back_text,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors[0].message}`);
      }
      throw error;
    }
  }

  async rejectCandidate(userId: string, candidateId: string): Promise<void> {
    try {
      // Get the candidate to verify it exists and belongs to the user
      const { data: candidate, error: fetchError } = await this.supabase
        .from("flashcard_candidates")
        .select("id, generation_id")
        .eq("id", candidateId)
        .eq("user_id", userId)
        .single();

      if (fetchError || !candidate) {
        throw new Error("Flashcard candidate not found");
      }

      // Update the candidate
      const { error: updateError } = await this.supabase
        .from("flashcard_candidates")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", candidateId)
        .eq("user_id", userId);

      if (updateError) {
        throw new Error(`Failed to update flashcard candidate: ${updateError.message}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors[0].message}`);
      }
      throw error;
    }
  }

  async listFlashcards(
    userId: string,
    params: z.infer<typeof listFlashcardsSchema>
  ): Promise<GetFlashcardsResponseDTO> {
    try {
      // Validate input
      listFlashcardsSchema.parse(params);

      const { page, limit, filter, sort } = params;

      // Build query
      let query = this.supabase
        .from("flashcards")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .range((page - 1) * limit, page * limit - 1);

      // Apply filters
      if (filter === "ai") {
        query = query.neq("created_by", "MAN");
      } else if (filter === "manual") {
        query = query.eq("created_by", "MAN");
      }

      // Apply sorting
      if (sort === "created_at") {
        query = query.order("created_at", { ascending: false });
      }

      // Execute query
      const { data: flashcards, error: dbError, count } = await query;

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Transform to DTOs
      const flashcardDTOs: FlashcardDTO[] = flashcards.map((card) => ({
        id: card.id,
        front_text: card.front_content,
        back_text: card.back_content,
        is_ai: card.created_by !== "MAN",
        created_at: card.created_at,
      }));

      return {
        flashcards: flashcardDTOs,
        pagination: {
          page,
          limit,
          total: count || 0,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors[0].message}`);
      }
      throw error;
    }
  }

  async getFlashcard(userId: string, flashcardId: string): Promise<FlashcardDTO> {
    try {
      // Validate ID
      if (!z.string().uuid().safeParse(flashcardId).success) {
        throw new Error("Invalid flashcard ID format");
      }

      // Fetch flashcard
      const { data: flashcard, error: dbError } = await this.supabase
        .from("flashcards")
        .select("*")
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .single();

      if (dbError) {
        if (dbError.code === "PGRST116") {
          throw new Error("Flashcard not found");
        }
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Transform to DTO
      return {
        id: flashcard.id,
        front_text: flashcard.front_content,
        back_text: flashcard.back_content,
        is_ai: flashcard.created_by !== "MAN",
        created_at: flashcard.created_at,
      };
    } catch (error) {
      throw error;
    }
  }

  async createFlashcard(userId: string, command: CreateFlashcardCommand): Promise<CreateFlashcardResponseDTO> {
    try {
      // Validate input
      createFlashcardSchema.parse(command);

      // Create flashcard
      const { data: flashcard, error: dbError } = await this.supabase
        .from("flashcards")
        .insert({
          front_content: command.front_text,
          back_content: command.back_text,
          user_id: userId,
          created_by: "MAN",
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Failed to create flashcard: ${dbError.message}`);
      }

      // Transform to DTO
      const flashcardDTO: FlashcardDTO = {
        id: flashcard.id,
        front_text: flashcard.front_content,
        back_text: flashcard.back_content,
        is_ai: false,
        created_at: flashcard.created_at,
      };

      return {
        message: "Flashcard created successfully",
        flashcard: flashcardDTO,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors[0].message}`);
      }
      throw error;
    }
  }

  async updateFlashcard(
    userId: string,
    flashcardId: string,
    command: UpdateFlashcardCommand
  ): Promise<UpdateFlashcardResponseDTO> {
    try {
      // Validate input
      updateFlashcardSchema.parse(command);

      if (!z.string().uuid().safeParse(flashcardId).success) {
        throw new Error("Invalid flashcard ID format");
      }

      // Check if flashcard exists and belongs to user
      const { data: existingCard, error: checkError } = await this.supabase
        .from("flashcards")
        .select("*")
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .single();

      if (checkError) {
        if (checkError.code === "PGRST116") {
          throw new Error("Flashcard not found");
        }
        throw new Error(`Database error: ${checkError.message}`);
      }

      // Update flashcard
      const { data: flashcard, error: updateError } = await this.supabase
        .from("flashcards")
        .update({
          front_content: command.front_text,
          back_content: command.back_text,
          created_by: "AI_EDIT",
          updated_at: new Date().toISOString(),
        })
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update flashcard: ${updateError.message}`);
      }

      // Transform to DTO
      const flashcardDTO: FlashcardDTO = {
        id: flashcard.id,
        front_text: flashcard.front_content,
        back_text: flashcard.back_content,
        is_ai: flashcard.created_by !== "MAN",
        created_at: flashcard.created_at,
      };

      return {
        message: "Flashcard updated successfully",
        flashcard: flashcardDTO,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors[0].message}`);
      }
      throw error;
    }
  }

  async deleteFlashcard(userId: string, flashcardId: string): Promise<DeleteFlashcardResponseDTO> {
    try {
      if (!z.string().uuid().safeParse(flashcardId).success) {
        throw new Error("Invalid flashcard ID format");
      }

      // Check if flashcard exists and belongs to user
      const { data: existingCard, error: checkError } = await this.supabase
        .from("flashcards")
        .select("id")
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .single();

      if (checkError) {
        if (checkError.code === "PGRST116") {
          throw new Error("Flashcard not found");
        }
        throw new Error(`Database error: ${checkError.message}`);
      }

      // Delete flashcard
      const { error: deleteError } = await this.supabase
        .from("flashcards")
        .delete()
        .eq("id", flashcardId)
        .eq("user_id", userId);

      if (deleteError) {
        throw new Error(`Failed to delete flashcard: ${deleteError.message}`);
      }

      return {
        message: "Flashcard deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  async completeGeneration(userId: string, generationId: string): Promise<CompleteGenerationResponseDTO> {
    try {
      // Validate generation ID
      if (!z.string().uuid().safeParse(generationId).success) {
        throw new Error("Invalid generation ID format");
      }

      // Check if generation exists and belongs to user
      const { data: generation, error: genError } = await this.supabase
        .from("generations")
        .select("id, status")
        .eq("id", generationId)
        .eq("user_id", userId)
        .single();

      if (genError) {
        if (genError.code === "PGRST116") {
          throw new Error("Generation not found");
        }
        throw new Error(`Database error: ${genError.message}`);
      }

      // Get all candidates for this generation
      const { data: candidates, error: candError } = await this.supabase
        .from("flashcard_candidates")
        .select("*")
        .eq("generation_id", generationId)
        .eq("user_id", userId);

      if (candError) {
        throw new Error(`Failed to fetch candidates: ${candError.message}`);
      }

      // Calculate statistics
      const stats = {
        total_candidates: candidates.length,
        accepted_unedited: candidates.filter((c) => c.status === "pending").length,
        accepted_edited: candidates.filter((c) => c.status === "edited").length,
        rejected: candidates.filter((c) => c.status === "rejected").length,
      };

      // Create flashcards for accepted candidates
      const acceptedCandidates = candidates.filter((c) => c.status === "pending" || c.status === "edited");
      const savedFlashcards: FlashcardDTO[] = [];

      for (const candidate of acceptedCandidates) {
        const { data: flashcard, error: createError } = await this.supabase
          .from("flashcards")
          .insert({
            front_content: candidate.front_content,
            back_content: candidate.back_content,
            user_id: userId,
            created_by: candidate.status === "edited" ? "AI_EDIT" : "AI_FULL",
            generation_id: generationId,
          })
          .select()
          .single();

        if (createError) {
          console.error(`Failed to create flashcard for candidate ${candidate.id}:`, createError);
          continue;
        }

        savedFlashcards.push({
          id: flashcard.id,
          front_text: flashcard.front_content,
          back_text: flashcard.back_content,
          is_ai: true,
          created_at: flashcard.created_at,
        });
      }

      // Update generation status
      const { data: updateResult, error: updateError } = await this.supabase
        .from("generations")
        .update({
          status: "completed",
          accepted_unedited_count: stats.accepted_unedited,
          accepted_edited_count: stats.accepted_edited,
        })
        .eq("id", generationId)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Failed to update generation:", updateError);
        throw new Error(`Failed to update generation: ${updateError.message}`);
      }

      return {
        message: "Generation review completed",
        stats: {
          total_candidates: stats.total_candidates,
          accepted: stats.accepted_unedited + stats.accepted_edited,
          rejected: stats.rejected,
        },
        saved_flashcards: savedFlashcards,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates flashcards for demo users without storing anything in the database
   * @param sourceText The source text to generate flashcards from
   * @returns Generated flashcard candidates
   */
  async generateFlashcardsForDemo(sourceText: string): Promise<FlashcardCandidateDTO[]> {
    try {
      // Validate input
      const validatedCommand = generateFlashcardSchema.parse({ source_text: sourceText });

      // Generate flashcard candidates using OpenRouter service
      const { candidates } = await this.aiService.generateFlashcards(validatedCommand.source_text);

      // Return candidates without storing anything
      return candidates;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors[0].message}`);
      }
      throw error;
    }
  }
}
