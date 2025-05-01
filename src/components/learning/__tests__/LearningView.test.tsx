/// <reference types="vitest" />
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { LearningView } from "../LearningView";
import type { FlashcardDTO } from "@/types";

// Mock UI components
vi.mock("@/components/ui/card", () => {
  return {
    Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children, className }: { children: React.ReactNode, className?: string }) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children, className }: { children: React.ReactNode, className?: string }) => <h3 data-testid="card-title">{children}</h3>,
    CardContent: ({ children, className }: { children: React.ReactNode, className?: string }) => <div data-testid="card-content">{children}</div>,
    CardFooter: ({ children, className }: { children: React.ReactNode, className?: string }) => <div data-testid="card-footer">{children}</div>
  };
});

vi.mock("@/components/ui/empty-state", () => {
  return {
    EmptyState: ({ 
      icon, 
      title, 
      description, 
      action 
    }: { 
      icon?: React.ReactNode, 
      title: string, 
      description?: string, 
      action?: React.ReactNode 
    }) => (
      <div data-testid="empty-state">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {action && <div data-testid="empty-state-action">{action}</div>}
      </div>
    )
  };
});

vi.mock("../LearningCard", () => {
  return {
    LearningCard: ({ flashcard }: { flashcard: FlashcardDTO }) => (
      <div data-testid="learning-card">
        <div>{flashcard.front_text}</div>
      </div>
    )
  };
});

vi.mock("../LearningStats", () => {
  return {
    LearningStats: () => <div data-testid="learning-stats">Stats Component</div>
  };
});

// Create mock responses
const mockResponses = {
  '/api/flashcards/due': {
    flashcards: [
      {
        id: "1",
        front_text: "Card 1 Front",
        back_text: "Card 1 Back",
        is_ai: false,
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        front_text: "Card 2 Front",
        back_text: "Card 2 Back",
        is_ai: true,
        created_at: new Date().toISOString()
      }
    ]
  },
  '/api/flashcards/learning-stats': {
    dueToday: 2,
    learningCards: 1,
    masteredCards: 1,
    totalReviews: 5
  }
};

// Setup fetch mock
const mockedFetch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  
  // Replace global fetch with a working mock implementation
  global.fetch = mockedFetch;
  
  // Default to successful responses
  mockedFetch.mockImplementation((url) => {
    const endpoint = url.toString();
    
    if (endpoint.includes('flashcards/due')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponses['/api/flashcards/due'])
      });
    }
    
    if (endpoint.includes('learning-stats')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponses['/api/flashcards/learning-stats'])
      });
    }
    
    return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LearningView", () => {
  it("fetches and displays due cards correctly", async () => {
    render(<LearningView />);

    // Initially shows loading state
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Wait for cards to load
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Shows first card
    await waitFor(() => {
      expect(screen.getByText("Card 1 Front")).toBeInTheDocument();
      expect(screen.getByText("Card 1 of 2")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("handles empty due cards state", async () => {
    // Override the default response for this test only
    mockedFetch.mockImplementation((url) => {
      const endpoint = url.toString();
      
      if (endpoint.includes('flashcards/due')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ flashcards: [] })
        });
      }
      
      if (endpoint.includes('learning-stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponses['/api/flashcards/learning-stats'])
        });
      }
      
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });

    render(<LearningView />);

    await waitFor(() => {
      expect(screen.getByText("All caught up!")).toBeInTheDocument();
      expect(screen.getByText(/no cards due for review/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
}); 