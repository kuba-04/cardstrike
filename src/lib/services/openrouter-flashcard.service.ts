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

    this.openRouter.configure({
      systemMessage: `
      You are a helpful AI assistant that generates vocabulary flashcards from provided text.

Your task is to extract the most useful single words or short phrases from the text such that, if a learner masters them, they will be able to understand the majority of the text’s meaning.

Selection guidelines:
- Focus on high-utility words or short phrases (key vocabulary, recurring terms, core expressions).
- Prefer terms that are essential for comprehension, not rare proper nouns or trivial words.
- Each flashcard must contain only one word or one short phrase.
- Avoid full sentences, explanations, or questions.
- Avoid duplicates or near-duplicates.
- Do not include grammar explanations or meta commentary.
- Keep the list concise but sufficient for understanding the text overall.

Flashcard format rules:
- Front: the original word or phrase exactly as it appears in the text, in the same language as the source text (the "front" language specified by the user, or auto-detected if not specified).
- Back: a clear, natural translation of that word or phrase in the target language (the "back" language specified by the user, defaulting to English if not specified).
- Do not add extra explanations unless absolutely necessary for correct meaning.
- Maintain consistent formatting across all cards.

You must respond in the following JSON format:
{
  "message": "Generated flashcards successfully",
  "usage": 1,
  "flashcards": [
    {
      "front": " إسمي",
      "back": "my name is"
    }
  ]
}
      `,
    });
  }

  public get modelName(): string {
    return this.openRouter.modelName;
  }

  async generateFlashcards(
    sourceText: string,
    frontLanguage?: string,
    backLanguage?: string
  ): Promise<FlashcardGenerationResponse> {
    try {
      // Build a dynamic prompt with language specification if provided
      let userPrompt = sourceText;
      if (frontLanguage || backLanguage) {
        const frontLang = frontLanguage || "the source text language";
        const backLang = backLanguage || "English";
        userPrompt = `Language specification:
- Front of card (input): ${frontLang}
- Back of card (translation): ${backLang}

Source text:
${sourceText}`;
      }

      const response = await this.openRouter.sendRequest(userPrompt);

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
