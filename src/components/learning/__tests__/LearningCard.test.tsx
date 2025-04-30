/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { LearningCard } from "../LearningCard";
import type { FlashcardDTO } from "@/types";
import type { SuperMemoGrade } from "@/lib/supermemo";

describe("LearningCard", () => {
  const mockFlashcard: FlashcardDTO = {
    id: 1,
    front_text: "What is the capital of France?",
    back_text: "Paris",
    is_ai: false,
    created_at: new Date().toISOString()
  };

  const mockOnGrade = vi.fn();
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles the complete grading flow correctly", async () => {
    // Render the component
    render(
      <LearningCard
        flashcard={mockFlashcard}
        onGrade={mockOnGrade}
        onNext={mockOnNext}
      />
    );

    // Initially shows front text
    expect(screen.getByText(mockFlashcard.front_text)).toBeInTheDocument();
    expect(screen.queryByText(mockFlashcard.back_text)).not.toBeInTheDocument();

    // Click to flip card
    fireEvent.click(screen.getByText(mockFlashcard.front_text));

    // Shows back text and grade buttons
    expect(screen.getByText(mockFlashcard.back_text)).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(6); // 6 grade buttons (0-5)

    // Click grade 5 button
    const perfectButton = screen.getByRole("button", { name: "5" });
    fireEvent.click(perfectButton);

    // Verify grade was recorded
    await waitFor(() => {
      expect(mockOnGrade).toHaveBeenCalledWith(mockFlashcard.id, 5 as SuperMemoGrade);
      expect(mockOnNext).toHaveBeenCalled();
    });

    // Verify card flips back
    expect(screen.getByText(mockFlashcard.front_text)).toBeInTheDocument();
    expect(screen.queryByText(mockFlashcard.back_text)).not.toBeInTheDocument();
  });
}); 