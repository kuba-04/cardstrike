/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { LearningCard } from "../LearningCard";
import type { FlashcardDTO } from "@/types";
import type { SuperMemoGrade } from "@/lib/supermemo";

describe("LearningCard", () => {
  const mockFlashcard: FlashcardDTO = {
    id: "1",
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
    
    // The back text may be in the DOM but should be visually hidden
    // Let's find the card container and check if it's not flipped
    const cardContainer = screen.getByRole("button", { name: /flashcard:/i });
    expect(cardContainer).toBeInTheDocument();
    expect(cardContainer.querySelector('.flashcard')?.classList.contains('flipped')).toBeFalsy();

    // Click to flip card
    fireEvent.click(cardContainer);

    // Shows back text and grade buttons
    expect(screen.getByText(mockFlashcard.back_text)).toBeInTheDocument();
    expect(cardContainer.querySelector('.flashcard')?.classList.contains('flipped')).toBeTruthy();
    
    const gradeButtons = screen.getAllByRole("button");
    expect(gradeButtons.length).toBeGreaterThan(1); // At least 1 for card + grade buttons

    // Click grade 5 button
    const perfectButton = screen.getByText("5");
    fireEvent.click(perfectButton);

    // Verify grade was recorded
    await waitFor(() => {
      expect(mockOnGrade).toHaveBeenCalledWith(mockFlashcard.id, 5 as SuperMemoGrade);
      expect(mockOnNext).toHaveBeenCalled();
    });
  });
}); 