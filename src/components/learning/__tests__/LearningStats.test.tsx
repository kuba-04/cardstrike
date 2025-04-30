/// <reference types="vitest" />
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { LearningStats } from "../LearningStats";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("LearningStats", () => {
  const mockStats = {
    dueToday: 5,
    learningCards: 3,
    masteredCards: 10,
    totalReviews: 25
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation(async () => ({
      ok: true,
      json: async () => mockStats
    }));
  });

  it("displays learning statistics accurately", async () => {
    render(<LearningStats />);

    // Initially shows loading state for all stats
    const loadingIndicators = screen.getAllByTestId("loading-indicator");
    expect(loadingIndicators).toHaveLength(4);

    // Wait for stats to load
    await waitFor(() => {
      expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();
    });

    // Verify all stats are displayed correctly
    expect(screen.getByText("5")).toBeInTheDocument(); // dueToday
    expect(screen.getByText("3")).toBeInTheDocument(); // learningCards
    expect(screen.getByText("10")).toBeInTheDocument(); // masteredCards
    expect(screen.getByText("25")).toBeInTheDocument(); // totalReviews

    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith("/api/flashcards/learning-stats");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("handles API error gracefully", async () => {
    const errorMessage = "Failed to fetch learning statistics";
    mockFetch.mockImplementationOnce(async () => ({
      ok: false,
      json: async () => ({ error: errorMessage })
    }));

    render(<LearningStats />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });
}); 