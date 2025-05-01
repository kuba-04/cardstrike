/// <reference types="vitest" />
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { LearningStats } from "../LearningStats";

// Mock UI components
vi.mock("@/components/ui/card", () => {
  return {
    Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children, className }: { children: React.ReactNode, className?: string }) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children, className }: { children: React.ReactNode, className?: string }) => <h3 data-testid="card-title">{children}</h3>,
    CardContent: ({ children, className }: { children: React.ReactNode, className?: string }) => <div data-testid="card-content">{children}</div>
  };
});

vi.mock("@/components/ui/collapsible", () => {
  return {
    Collapsible: ({ children }: { children: React.ReactNode }) => <div data-testid="collapsible">{children}</div>,
    CollapsibleTrigger: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => <div data-testid="collapsible-trigger">{children}</div>,
    CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div data-testid="collapsible-content">{children}</div>
  };
});

// Create mock responses
const mockStats = {
  dueToday: 5,
  learningCards: 3,
  masteredCards: 10,
  totalReviews: 25
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
    
    if (endpoint.includes('learning-stats')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStats)
      });
    }
    
    return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LearningStats", () => {
  it("displays learning statistics accurately", async () => {
    render(<LearningStats />);

    // Wait for stats to load - we need to check for the actual stats values
    await waitFor(() => {
      // Find stat values using test ids that we added to the mocked components
      const statValues = screen.getAllByTestId("card-content");
      
      // Check that all stat values are displayed
      expect(statValues.length).toBeGreaterThanOrEqual(4);
      
      // At least one of them should contain each expected value
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("handles API error gracefully", async () => {
    const errorMessage = "Failed to fetch learning statistics";
    
    // Override the default response for this test only
    mockedFetch.mockImplementation((url) => {
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage })
      });
    });

    render(<LearningStats />);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
    }, { timeout: 3000 });
  });
}); 