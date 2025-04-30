/// <reference types="vitest" />
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { LearningView } from "../LearningView";
import type { FlashcardDTO } from "@/types";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("LearningView", () => {
  const mockDueCards: FlashcardDTO[] = [
    {
      id: 1,
      front_text: "Card 1 Front",
      back_text: "Card 1 Back",
      is_ai: false,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      front_text: "Card 2 Front",
      back_text: "Card 2 Back",
      is_ai: true,
      created_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation(async (url) => {
      if (url === "/api/flashcards/due") {
        return {
          ok: true,
          json: async () => ({ flashcards: mockDueCards })
        };
      }
      if (url === "/api/flashcards/learning-stats") {
        return {
          ok: true,
          json: async () => ({
            dueToday: 2,
            learningCards: 1,
            masteredCards: 1,
            totalReviews: 5
          })
        };
      }
      throw new Error(`Unhandled fetch url: ${url}`);
    });
  });

  it("fetches and displays due cards correctly", async () => {
    render(<LearningView />);

    // Initially shows loading state
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

    // Wait for cards to load
    await waitFor(() => {
      expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();
    });

    // Shows first card
    expect(screen.getByText("Card 1 Front")).toBeInTheDocument();
    expect(screen.getByText("Card 1 of 2")).toBeInTheDocument();

    // Verify API calls
    expect(mockFetch).toHaveBeenCalledWith("/api/flashcards/due");
    expect(mockFetch).toHaveBeenCalledWith("/api/flashcards/learning-stats");
  });

  it("handles empty due cards state", async () => {
    mockFetch.mockImplementationOnce(async (url) => {
      if (url === "/api/flashcards/due") {
        return {
          ok: true,
          json: async () => ({ flashcards: [] })
        };
      }
      return mockFetch(url);
    });

    render(<LearningView />);

    await waitFor(() => {
      expect(screen.getByText("All caught up!")).toBeInTheDocument();
      expect(screen.getByText(/no cards due for review/i)).toBeInTheDocument();
    });
  });
}); 