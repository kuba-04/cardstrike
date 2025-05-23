import { OpenRouterService, OpenRouterError, OpenRouterProviderError } from "./openrouter.service";
import type { FlashcardCandidateDTO } from "../../types";
import { v4 as uuidv4 } from "uuid";

interface FlashcardResponse {
  front: string;
  back: string;
}

interface GeneratedResponse {
  message: string;
  usage: number;
  flashcards: FlashcardResponse[];
}

export interface FlashcardGenerationResponse {
  candidates: FlashcardCandidateDTO[];
}

export class OpenRouterFlashcardService {
  private openRouter: OpenRouterService;

  constructor() {
    this.openRouter = new OpenRouterService();

    // Configure OpenRouter for flashcard generation
    this.openRouter.configure({
      systemMessage: `You are a helpful AI assistant that generates flashcards from provided text.
Your task is to create educational flashcards that help users learn and memorize key concepts.

Guidelines for creating flashcards:
1. Each flashcard should focus on a single concept or fact
2. Front side should be a clear, concise question
3. Back side should contain a direct, accurate answer
4. Avoid overly complex or compound questions
5. Ensure answers are complete but concise
6. Use clear, simple language
7. Maintain factual accuracy
8. Format consistently across all cards

You must respond in the following JSON format:
{
  "message": "Generated flashcards successfully",
  "usage": 1,
  "flashcards": [
    {
      "front": "Question text here?",
      "back": "Answer text here"
    }
  ]
}`,
    });
  }

  public get modelName(): string {
    return this.openRouter.modelName;
  }

  async generateFlashcards(sourceText: string): Promise<FlashcardGenerationResponse> {
    try {
      const response = await this.openRouter.sendRequest(sourceText);

      // Parse the response and convert to FlashcardCandidateDTO format
      const parsedResponse = JSON.parse(response.choices[0].message.content) as GeneratedResponse;

      const candidates: FlashcardCandidateDTO[] = parsedResponse.flashcards.map((card) => ({
        candidate_id: uuidv4(),
        front_text: card.front,
        back_text: card.back,
        status: "pending",
      }));

      return { candidates };
    } catch (error) {
      if (error instanceof OpenRouterProviderError) {
        // Handle provider-specific errors with user-friendly messages
        if (error.code === 429) {
          throw new Error(
            `The AI service (${error.providerName}) is currently at capacity. Please try again in a few minutes.`
          );
        }
        throw new Error(`The AI service (${error.providerName}) encountered an error. Please try again later.`);
      }

      if (error instanceof OpenRouterError) {
        throw new Error("Failed to generate flashcards due to a service error. Please try again later.");
      }

      throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
