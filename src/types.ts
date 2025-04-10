import type { Database } from './db/database.types'

/**
 * Entity Type alias for flashcards derived from the database model.
 * This references the underlying flashcards row definition.
 */
export type FlashcardEntity = Database["public"]["Tables"]["flashcards"]["Row"]

/**
 * DTO for representing a flashcard in API responses.
 * Maps DB 'front_content' to 'front_text' and DB 'back_content' to 'back_text'.
 * 'is_ai' is a derived flag (true if 'created_by' is not 'MAN').
 */
export type FlashcardDTO = {
  id: FlashcardEntity["id"]
  front_text: FlashcardEntity["front_content"]
  back_text: FlashcardEntity["back_content"]
  is_ai: boolean // Derived from flashcardEntity.created_by (true if created_by !== 'MAN')
  created_at: FlashcardEntity["created_at"]
}

/**
 * DTO for pagination parameters in list endpoints.
 */
export type PaginationDTO = {
  page: number
  limit: number
  total: number
}

/**
 * Response DTO for fetching flashcards.
 */
export type GetFlashcardsResponseDTO = {
  flashcards: FlashcardDTO[]
  pagination: PaginationDTO
}

/**
 * Command Model for creating a new flashcard.
 * Uses the same text types as in the database entity.
 */
export type CreateFlashcardCommand = {
  front_text: FlashcardEntity["front_content"]
  back_text: FlashcardEntity["back_content"]
}

/**
 * Response DTO returned after creating a flashcard.
 */
export type CreateFlashcardResponseDTO = {
  message: string
  flashcard: FlashcardDTO
}

/**
 * Command Model for updating an existing flashcard.
 */
export type UpdateFlashcardCommand = {
  front_text: string
  back_text: string
}

/**
 * Response DTO returned after updating a flashcard.
 */
export type UpdateFlashcardResponseDTO = {
  message: string
  flashcard: FlashcardDTO
}

/**
 * Response DTO returned after deleting a flashcard.
 */
export type DeleteFlashcardResponseDTO = {
  message: string
}

/**
 * Command Model for generating flashcards via an AI service.
 */
export type GenerateFlashcardCommand = {
  source_text: string
}

/**
 * DTO for an individual flashcard candidate generated by AI.
 */
export type FlashcardCandidateDTO = {
  candidate_id: string
  front_text: string
  back_text: string
  status: 'pending' | 'accepted' | 'rejected'
}

/**
 * Response DTO for AI-driven flashcard generation.
 */
export type GenerateFlashcardResponseDTO = {
  generation_id: string
  candidates: FlashcardCandidateDTO[]
}

/**
 * Command Model for updating a generated flashcard candidate.
 * 'accept' indicates whether the candidate is accepted (true) or rejected (false).
 */
export type UpdateFlashcardCandidateCommand = {
  front_text: string
  back_text: string
  accept: boolean
}

/**
 * Response DTO returned after updating a flashcard candidate.
 */
export type UpdateFlashcardCandidateResponseDTO = {
  message: string
  candidate: {
    candidate_id: string
    front_text: string
    back_text: string
  }
}

/**
 * Response DTO returned after completing the AI flashcard generation review.
 */
export type CompleteGenerationResponseDTO = {
  message: string
  stats: {
    total_candidates: number
    accepted: number
    rejected: number
  }
  saved_flashcards: FlashcardDTO[]
}