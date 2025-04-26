import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "@testing-library/react";
import { FlashcardGenerationView } from "../../components/FlashcardGenerationView";
import { useFlashcardGeneration } from "../../components/hooks/useFlashcardGeneration";
import { useDemoSession } from "../../components/hooks/useDemoSession";

// Mock the modules
vi.mock("../../components/hooks/useFlashcardGeneration");
vi.mock("../../components/hooks/useDemoSession");

describe("FlashcardGenerationView", () => {
  const mockGenerateFlashcards = vi.fn();
  const mockSetSourceText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useFlashcardGeneration
    vi.mocked(useFlashcardGeneration).mockImplementation(() => ({
      sourceText: "",
      setSourceText: mockSetSourceText,
      generationId: null,
      candidates: [],
      isLoadingGeneration: false,
      isLoadingCompletion: false,
      isEditingCandidateId: null,
      error: null,
      generateFlashcards: mockGenerateFlashcards,
      rejectCandidate: vi.fn(),
      updateCandidate: vi.fn(),
      completeReview: vi.fn(),
      startEditing: vi.fn(),
      cancelEditing: vi.fn(),
    }));

    // Default mock implementation for useDemoSession
    vi.mocked(useDemoSession).mockImplementation(() => ({
      isDemo: false,
      hasUsedGeneration: false,
      markGenerationUsed: vi.fn(),
    }));
  });

  it("should render text input area and generate button", async () => {
    await act(async () => {
      render(<FlashcardGenerationView />);
    });

    expect(screen.getByLabelText(/source text/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
  });

  it("should show demo mode alert when in demo", async () => {
    vi.mocked(useDemoSession).mockImplementation(() => ({
      isDemo: true,
      hasUsedGeneration: false,
      markGenerationUsed: vi.fn(),
    }));

    await act(async () => {
      render(<FlashcardGenerationView />);
    });

    expect(screen.getByText(/you are in demo mode/i)).toBeInTheDocument();
  });

  it("should not call generate when text length is invalid", async () => {
    await act(async () => {
      render(<FlashcardGenerationView />);
    });

    const generateButton = screen.getByRole("button", { name: /generate/i });
    await act(async () => {
      await fireEvent.click(generateButton);
    });

    expect(mockGenerateFlashcards).not.toHaveBeenCalled();
  });

  it("should call generate when input is valid", async () => {
    const validText = "a".repeat(100); // Valid length text

    vi.mocked(useFlashcardGeneration).mockImplementation(() => ({
      sourceText: validText,
      setSourceText: mockSetSourceText,
      generationId: null,
      candidates: [],
      isLoadingGeneration: false,
      isLoadingCompletion: false,
      isEditingCandidateId: null,
      error: null,
      generateFlashcards: mockGenerateFlashcards,
      rejectCandidate: vi.fn(),
      updateCandidate: vi.fn(),
      completeReview: vi.fn(),
      startEditing: vi.fn(),
      cancelEditing: vi.fn(),
    }));

    await act(async () => {
      render(<FlashcardGenerationView />);
    });

    const generateButton = screen.getByRole("button", { name: /generate/i });
    await act(async () => {
      await fireEvent.click(generateButton);
    });

    expect(mockGenerateFlashcards).toHaveBeenCalled();
  });

  it("should show loading indicator while generating", async () => {
    vi.mocked(useFlashcardGeneration).mockImplementation(() => ({
      sourceText: "a".repeat(100),
      setSourceText: mockSetSourceText,
      generationId: null,
      candidates: [],
      isLoadingGeneration: true,
      isLoadingCompletion: false,
      isEditingCandidateId: null,
      error: null,
      generateFlashcards: mockGenerateFlashcards,
      rejectCandidate: vi.fn(),
      updateCandidate: vi.fn(),
      completeReview: vi.fn(),
      startEditing: vi.fn(),
      cancelEditing: vi.fn(),
    }));

    await act(async () => {
      render(<FlashcardGenerationView />);
    });

    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });
});
