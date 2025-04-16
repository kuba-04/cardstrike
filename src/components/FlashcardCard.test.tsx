import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, mockFlashcard } from '../test/test-utils';
import FlashcardCard from './FlashcardCard';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('FlashcardCard', () => {
    const defaultProps = {
        flashcard: mockFlashcard,
        onDelete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders flashcard content correctly', () => {
            render(<FlashcardCard {...defaultProps} />);

            // Find the front text label first
            const frontLabel = screen.getByText('Front');
            expect(frontLabel).toBeInTheDocument();

            // Find the front text content
            const frontText = screen.getByText(mockFlashcard.front_text);
            expect(frontText).toBeInTheDocument();

            // Check for the AI badges (one on each side of the card)
            const aiBadges = screen.getAllByText(/ai generated/i);
            expect(aiBadges).toHaveLength(2);
        });
    });

    describe('Interactions', () => {
        it('handles deletion error state', async () => {
            // Mock the fetch call to fail
            global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to delete'));

            const user = userEvent.setup();
            const onDelete = vi.fn();
            render(
                <FlashcardCard {...defaultProps} onDelete={onDelete} />
            );

            const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
            await user.click(deleteButton);

            // Wait for the error state to resolve
            await waitFor(() => {
                expect(deleteButton).toHaveTextContent(/delete/i);
                expect(deleteButton).not.toBeDisabled();
            });

            // Verify onDelete was not called
            expect(onDelete).not.toHaveBeenCalled();
        });
    });
}); 