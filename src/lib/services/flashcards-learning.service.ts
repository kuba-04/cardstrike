import type { SupabaseClient } from "@/db/supabase.client";
import { supermemo, type SuperMemoGrade, calculateNextReviewDate } from "@/lib/supermemo";
import type { FlashcardDTO } from "@/types";

export class FlashcardsLearningService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Transforms a database flashcard entity to a DTO
   */
  private mapFlashcardToDTO(flashcard: any): FlashcardDTO {
    return {
      id: flashcard.id,
      front_text: flashcard.front_content,
      back_text: flashcard.back_content,
      is_ai: flashcard.created_by !== "MAN",
      created_at: flashcard.created_at,
    };
  }

  /**
   * Fetches all flashcards that are due for review
   */
  async getDueFlashcards(userId: string): Promise<{ flashcards: FlashcardDTO[] }> {
    const today = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .or(`next_review_at.lte.${today},next_review_at.is.null`)
      .order("next_review_at", { ascending: true });

    if (error) {
      console.error("Error fetching due flashcards:", error);
      throw new Error(`Failed to fetch due flashcards: ${error.message}`);
    }

    return {
      flashcards: (data || []).map(this.mapFlashcardToDTO),
    };
  }

  /**
   * Records a flashcard review using the SuperMemo algorithm
   */
  async recordFlashcardReview(
    userId: string,
    flashcardId: number,
    grade: SuperMemoGrade
  ): Promise<{ flashcard: FlashcardDTO }> {
    // 1. Fetch the current flashcard data
    const { data: flashcard, error: fetchError } = await this.supabase
      .from("flashcards")
      .select("*")
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching flashcard:", fetchError);
      throw new Error(`Failed to fetch flashcard: ${fetchError.message}`);
    }

    // 2. Calculate new SuperMemo values
    const result = supermemo(
      {
        interval: flashcard.interval || 0,
        repetition: flashcard.repetition_count || 0,
        efactor: flashcard.ease_factor || 2.5,
      },
      grade
    );

    const nextReviewDate = calculateNextReviewDate(result.interval);

    // 3. Update the flashcard
    const { data: updatedFlashcard, error: updateError } = await this.supabase
      .from("flashcards")
      .update({
        interval: result.interval,
        repetition_count: result.repetition,
        ease_factor: result.efactor,
        last_review_at: new Date().toISOString(),
        next_review_at: nextReviewDate.toISOString(),
      })
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating flashcard:", updateError);
      throw new Error(`Failed to update flashcard: ${updateError.message}`);
    }

    return {
      flashcard: this.mapFlashcardToDTO(updatedFlashcard),
    };
  }

  /**
   * Fetches learning statistics for a user
   */
  async getLearningStats(userId: string): Promise<{
    dueToday: number;
    learningCards: number;
    masteredCards: number;
    totalReviews: number;
  }> {
    const today = new Date().toISOString();

    // Get cards due today
    const { count: dueToday, error: dueError } = await this.supabase
      .from("flashcards")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .or(`next_review_at.lte.${today},next_review_at.is.null`);

    if (dueError) {
      throw new Error(`Failed to fetch due cards count: ${dueError.message}`);
    }

    // Get cards in learning (repetition < 3)
    const { count: learningCards, error: learningError } = await this.supabase
      .from("flashcards")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .lt("repetition_count", 3)
      .not("repetition_count", "is", null);

    if (learningError) {
      throw new Error(`Failed to fetch learning cards count: ${learningError.message}`);
    }

    // Get mastered cards (repetition >= 3)
    const { count: masteredCards, error: masteredError } = await this.supabase
      .from("flashcards")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .gte("repetition_count", 3);

    if (masteredError) {
      throw new Error(`Failed to fetch mastered cards count: ${masteredError.message}`);
    }

    // Get total reviews (sum of repetitions)
    const { data: totalReviewsData, error: reviewsError } = await this.supabase
      .from("flashcards")
      .select("repetition_count")
      .eq("user_id", userId)
      .not("repetition_count", "is", null);

    if (reviewsError) {
      throw new Error(`Failed to fetch total reviews: ${reviewsError.message}`);
    }

    const totalReviews = totalReviewsData.reduce((sum, card) => sum + (card.repetition_count || 0), 0);

    return {
      dueToday: dueToday || 0,
      learningCards: learningCards || 0,
      masteredCards: masteredCards || 0,
      totalReviews,
    };
  }

  /**
   * Initializes SuperMemo data for flashcards that don't have it
   */
  async initializeFlashcardsForLearning(userId: string): Promise<{ count: number }> {
    // Get all flashcards without SuperMemo data
    const { data: flashcards, error: fetchError } = await this.supabase
      .from("flashcards")
      .select("id")
      .eq("user_id", userId)
      .is("interval", null);

    if (fetchError) {
      throw new Error(`Failed to fetch flashcards for initialization: ${fetchError.message}`);
    }

    if (flashcards.length === 0) {
      return { count: 0 };
    }

    // Initialize SuperMemo data for each card
    const initialValues = {
      interval: 0,
      repetition_count: 0,
      ease_factor: 2.5,
      next_review_at: new Date().toISOString(),
    };

    const { error: updateError } = await this.supabase
      .from("flashcards")
      .update(initialValues)
      .in(
        "id",
        flashcards.map((f) => f.id)
      )
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(`Failed to initialize flashcards: ${updateError.message}`);
    }

    return { count: flashcards.length };
  }
} 