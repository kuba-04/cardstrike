import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardGenerationView } from '../../components/FlashcardGenerationView';
import { useFlashcardGeneration } from '../../components/hooks/useFlashcardGeneration';
import { useDemoSession } from '../../components/hooks/useDemoSession';

// Mock the modules
vi.mock('../../components/hooks/useFlashcardGeneration');
vi.mock('../../components/hooks/useDemoSession');

describe('FlashcardGenerationView', () => {
    const mockGenerateFlashcards = vi.fn();
    const mockSetSourceText = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementation for useFlashcardGeneration
        (useFlashcardGeneration as any).mockReturnValue({
            sourceText: '',
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
            cancelEditing: vi.fn()
        });

        // Default mock implementation for useDemoSession
        (useDemoSession as any).mockReturnValue({
            isDemo: false
        });
    });

    it('should render text input area and generate button', () => {
        render(<FlashcardGenerationView />);

        expect(screen.getByLabelText(/source text/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    });

    it('should show demo mode alert when in demo', () => {
        (useDemoSession as any).mockReturnValue({
            isDemo: true
        });

        render(<FlashcardGenerationView />);

        expect(screen.getByText(/you are in demo mode/i)).toBeInTheDocument();
    });

    it('should not call generate when text length is invalid', async () => {
        render(<FlashcardGenerationView />);

        const generateButton = screen.getByRole('button', { name: /generate/i });
        await fireEvent.click(generateButton);

        expect(mockGenerateFlashcards).not.toHaveBeenCalled();
    });

    it('should call generate when input is valid', async () => {
        const validText = 'a'.repeat(100); // Valid length text

        (useFlashcardGeneration as any).mockReturnValue({
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
            cancelEditing: vi.fn()
        });

        render(<FlashcardGenerationView />);

        const generateButton = screen.getByRole('button', { name: /generate/i });
        await fireEvent.click(generateButton);

        expect(mockGenerateFlashcards).toHaveBeenCalled();
    });

    it('should show loading indicator while generating', () => {
        (useFlashcardGeneration as any).mockReturnValue({
            sourceText: 'a'.repeat(100),
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
            cancelEditing: vi.fn()
        });

        render(<FlashcardGenerationView />);

        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
}); 