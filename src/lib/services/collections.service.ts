import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type {
  CollectionDTO,
  CollectionStatsDTO,
  CollectionWithStatsDTO,
  CreateCollectionCommand,
  CreateCollectionResponseDTO,
  DeleteCollectionResponseDTO,
  GetCollectionsResponseDTO,
  UpdateCollectionCommand,
  UpdateCollectionResponseDTO,
} from "../../types";

// Validation schemas
export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name cannot be empty")
    .max(100, "Collection name cannot exceed 100 characters"),
});

export const updateCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name cannot be empty")
    .max(100, "Collection name cannot exceed 100 characters"),
});

export class CollectionsService {
  private supabase: SupabaseClient<any, "public", any>;

  constructor(supabase: SupabaseClient<any, "public", any>) {
    this.supabase = supabase;
  }

  /**
   * Creates a new collection for a user
   */
  async createCollection(
    userId: string,
    command: CreateCollectionCommand
  ): Promise<CreateCollectionResponseDTO> {
    try {
      // Validate input
      createCollectionSchema.parse(command);

      // Create collection
      const { data: collection, error: dbError } = await this.supabase
        .from("collections")
        .insert({
          name: command.name,
          user_id: userId,
        })
        .select()
        .single();

      if (dbError) {
        // Handle unique constraint violation
        if (dbError.code === "23505") {
          throw new Error("A collection with this name already exists");
        }
        throw new Error(`Failed to create collection: ${dbError.message}`);
      }

      const collectionDTO: CollectionDTO = {
        id: collection.id,
        name: collection.name,
        created_at: collection.created_at,
      };

      return {
        message: "Collection created successfully",
        collection: collectionDTO,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors[0].message}`);
      }
      throw error;
    }
  }

  /**
   * Lists all collections for a user with statistics
   */
  async listCollections(userId: string): Promise<GetCollectionsResponseDTO> {
    try {
      // Fetch all collections for the user
      const { data: collections, error: collectionsError } = await this.supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (collectionsError) {
        throw new Error(`Failed to fetch collections: ${collectionsError.message}`);
      }

      // Fetch stats for each collection
      const collectionsWithStats: CollectionWithStatsDTO[] = await Promise.all(
        collections.map(async (collection) => {
          const stats = await this.getCollectionStats(userId, collection.id);

          return {
            id: collection.id,
            name: collection.name,
            created_at: collection.created_at,
            stats,
          };
        })
      );

      return {
        collections: collectionsWithStats,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets a single collection by ID
   */
  async getCollection(userId: string, collectionId: string): Promise<CollectionDTO> {
    try {
      // Validate ID
      if (!z.string().uuid().safeParse(collectionId).success) {
        throw new Error("Invalid collection ID format");
      }

      // Fetch collection
      const { data: collection, error: dbError } = await this.supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .eq("user_id", userId)
        .single();

      if (dbError) {
        if (dbError.code === "PGRST116") {
          throw new Error("Collection not found");
        }
        throw new Error(`Database error: ${dbError.message}`);
      }

      return {
        id: collection.id,
        name: collection.name,
        created_at: collection.created_at,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates a collection's name
   */
  async updateCollection(
    userId: string,
    collectionId: string,
    command: UpdateCollectionCommand
  ): Promise<UpdateCollectionResponseDTO> {
    try {
      // Validate input
      updateCollectionSchema.parse(command);

      if (!z.string().uuid().safeParse(collectionId).success) {
        throw new Error("Invalid collection ID format");
      }

      // Check if collection exists and belongs to user
      const { data: existingCollection, error: checkError } = await this.supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .eq("user_id", userId)
        .single();

      if (checkError) {
        if (checkError.code === "PGRST116") {
          throw new Error("Collection not found");
        }
        throw new Error(`Database error: ${checkError.message}`);
      }

      // Update collection
      const { data: collection, error: updateError } = await this.supabase
        .from("collections")
        .update({
          name: command.name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", collectionId)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) {
        // Handle unique constraint violation
        if (updateError.code === "23505") {
          throw new Error("A collection with this name already exists");
        }
        throw new Error(`Failed to update collection: ${updateError.message}`);
      }

      const collectionDTO: CollectionDTO = {
        id: collection.id,
        name: collection.name,
        created_at: collection.created_at,
      };

      return {
        message: "Collection updated successfully",
        collection: collectionDTO,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors[0].message}`);
      }
      throw error;
    }
  }

  /**
   * Deletes a collection (sets flashcards' collection_id to null)
   */
  async deleteCollection(userId: string, collectionId: string): Promise<DeleteCollectionResponseDTO> {
    try {
      if (!z.string().uuid().safeParse(collectionId).success) {
        throw new Error("Invalid collection ID format");
      }

      // Check if collection exists and belongs to user
      const { data: existingCollection, error: checkError } = await this.supabase
        .from("collections")
        .select("id")
        .eq("id", collectionId)
        .eq("user_id", userId)
        .single();

      if (checkError) {
        if (checkError.code === "PGRST116") {
          throw new Error("Collection not found");
        }
        throw new Error(`Database error: ${checkError.message}`);
      }

      // Delete collection (ON DELETE SET NULL will handle flashcards)
      const { error: deleteError } = await this.supabase
        .from("collections")
        .delete()
        .eq("id", collectionId)
        .eq("user_id", userId);

      if (deleteError) {
        throw new Error(`Failed to delete collection: ${deleteError.message}`);
      }

      return {
        message: "Collection deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets statistics for a specific collection
   */
  async getCollectionStats(userId: string, collectionId: string): Promise<CollectionStatsDTO> {
    try {
      // Fetch all flashcards in this collection
      const { data: flashcards, error: flashcardsError } = await this.supabase
        .from("flashcards")
        .select("ease_factor, next_review_at")
        .eq("user_id", userId)
        .eq("collection_id", collectionId);

      if (flashcardsError) {
        throw new Error(`Failed to fetch flashcard stats: ${flashcardsError.message}`);
      }

      const totalCards = flashcards.length;

      // Calculate due cards (cards with next_review_at <= now or null)
      const now = new Date();
      const dueCards = flashcards.filter((card) => {
        if (!card.next_review_at) return true;
        return new Date(card.next_review_at) <= now;
      }).length;

      // Calculate average ease factor
      const cardsWithEaseFactor = flashcards.filter((card) => card.ease_factor !== null);
      const avgEaseFactor =
        cardsWithEaseFactor.length > 0
          ? cardsWithEaseFactor.reduce((sum, card) => sum + (card.ease_factor || 0), 0) /
            cardsWithEaseFactor.length
          : 2.5; // Default value if no cards have been reviewed

      // Calculate mastery color
      const masteryColor = this.calculateMasteryColor(avgEaseFactor, cardsWithEaseFactor.length === 0);

      return {
        total_cards: totalCards,
        due_cards: dueCards,
        avg_ease_factor: avgEaseFactor,
        mastery_color: masteryColor,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculates the mastery color based on average ease factor
   * 
   * @param avgEaseFactor - Average ease factor for the collection
   * @param noReviewedCards - Whether there are no reviewed cards yet
   * @returns Color indicating mastery level
   */
  calculateMasteryColor(
    avgEaseFactor: number,
    noReviewedCards: boolean = false
  ): "red" | "yellow" | "green" | "gray" {
    // If no cards have been reviewed yet, show gray (neutral)
    if (noReviewedCards) {
      return "gray";
    }

    // Color mapping based on ease factor
    // ease_factor ranges from 1.3 (hardest) to 2.5 (easiest)
    // Default for new cards is 2.5
    if (avgEaseFactor >= 2.2) {
      return "green"; // Well-known (grades mostly 4-5)
    }
    if (avgEaseFactor >= 1.8) {
      return "yellow"; // Moderately known (grades mostly 3)
    }
    return "red"; // Poorly known (grades mostly 0-2)
  }
}
