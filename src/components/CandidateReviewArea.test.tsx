import { describe, it, expect, vi } from 'vitest';
import { render, mockCandidate } from '../test/test-utils';
import { CandidateReviewArea } from './CandidateReviewArea';
import { screen, within } from '@testing-library/react';

describe('CandidateReviewArea', () => {
    const defaultProps = {
        candidates: [
            { ...mockCandidate, candidate_id: '1' },
            { ...mockCandidate, candidate_id: '2', local_status: 'rejected' as const },
            { ...mockCandidate, candidate_id: '3', local_status: 'edited-saved' as const },
        ],
        isLoadingCompletion: false,
        isEditingCandidateId: null,
        onRejectCandidate: vi.fn(),
        onUpdateCandidate: vi.fn(),
        onStartEditing: vi.fn(),
        onCancelEditing: vi.fn(),
        onCompleteReview: vi.fn(),
    };

    it('renders all candidates', () => {
        render(<CandidateReviewArea {...defaultProps} />);

        const candidates = screen.getAllByText(/test front/i);
        expect(candidates).toHaveLength(3);
    });

    it('displays correct status counts', () => {
        render(<CandidateReviewArea {...defaultProps} />);

        const statusText = screen.getByText(/2 accepted · 1 rejected · 3 total/i);
        expect(statusText).toBeInTheDocument();
    });

    it('disables complete review button when no candidates are accepted', () => {
        render(
            <CandidateReviewArea
                {...defaultProps}
                candidates={[
                    { ...mockCandidate, candidate_id: '1', local_status: 'rejected' as const },
                    { ...mockCandidate, candidate_id: '2', local_status: 'rejected' as const },
                ]}
            />
        );

        const completeButton = screen.getByRole('button', { name: /complete review/i });
        expect(completeButton).toBeDisabled();
    });

    it('disables complete review button while editing a candidate', () => {
        render(
            <CandidateReviewArea
                {...defaultProps}
                isEditingCandidateId="1"
            />
        );

        const completeButton = screen.getByRole('button', { name: /complete review/i });
        expect(completeButton).toBeDisabled();
    });

    it('shows loading state during completion', () => {
        render(
            <CandidateReviewArea
                {...defaultProps}
                isLoadingCompletion={true}
            />
        );

        expect(screen.getByText(/saving/i)).toBeInTheDocument();
        const completeButton = screen.getByRole('button', { name: /saving/i });
        expect(completeButton).toBeDisabled();
    });

    it('handles candidate rejection', async () => {
        const onRejectCandidate = vi.fn();
        const { user } = render(
            <CandidateReviewArea
                {...defaultProps}
                onRejectCandidate={onRejectCandidate}
            />
        );

        const firstCandidate = screen.getAllByTestId('flashcard-candidate')[0];
        const rejectButton = within(firstCandidate).getByRole('button', { name: /reject flashcard/i });

        await user.click(rejectButton);
        expect(onRejectCandidate).toHaveBeenCalledWith('1');
    });

    it('handles starting candidate edit', async () => {
        const onStartEditing = vi.fn();
        const { user } = render(
            <CandidateReviewArea
                {...defaultProps}
                onStartEditing={onStartEditing}
            />
        );

        const firstCandidate = screen.getAllByTestId('flashcard-candidate')[0];
        const editButton = within(firstCandidate).getByRole('button', { name: /edit flashcard/i });

        await user.click(editButton);
        expect(onStartEditing).toHaveBeenCalledWith('1');
    });

    it('handles completing review', async () => {
        const onCompleteReview = vi.fn();
        const { user } = render(
            <CandidateReviewArea
                {...defaultProps}
                onCompleteReview={onCompleteReview}
            />
        );

        const completeButton = screen.getByRole('button', { name: /complete review/i });
        await user.click(completeButton);

        expect(onCompleteReview).toHaveBeenCalled();
    });
}); 