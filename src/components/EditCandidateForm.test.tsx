import { describe, it, expect, vi } from 'vitest';
import { render, mockCandidate, testIds } from '../test/test-utils';
import { EditCandidateForm } from './EditCandidateForm';
import { screen, waitFor } from '@testing-library/react';

describe('EditCandidateForm', () => {
    const defaultProps = {
        candidate: mockCandidate,
        onSave: vi.fn(),
        onCancel: vi.fn(),
    };

    it('renders with initial values', () => {
        render(<EditCandidateForm {...defaultProps} />);

        const frontInput = screen.getByLabelText(/front/i) as HTMLTextAreaElement;
        const backInput = screen.getByLabelText(/back/i) as HTMLTextAreaElement;

        expect(frontInput.value).toBe(mockCandidate.front_text);
        expect(backInput.value).toBe(mockCandidate.back_text);
    });

    it('handles form submission with valid data', async () => {
        const onSave = vi.fn();
        const { user } = render(<EditCandidateForm {...defaultProps} onSave={onSave} />);

        const frontInput = screen.getByLabelText(/front/i);
        const backInput = screen.getByLabelText(/back/i);
        const submitButton = screen.getByRole('button', { name: /save changes/i });

        await user.clear(frontInput);
        await user.type(frontInput, 'New Front Text');
        await user.clear(backInput);
        await user.type(backInput, 'New Back Text');
        await user.click(submitButton);

        expect(onSave).toHaveBeenCalledWith({
            front_text: 'New Front Text',
            back_text: 'New Back Text',
        });
    });

    it('shows loading state during submission', async () => {
        const onSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
        const { user } = render(<EditCandidateForm {...defaultProps} onSave={onSave} />);

        const submitButton = screen.getByRole('button', { name: /save changes/i });
        await user.click(submitButton);

        expect(screen.getByText(/saving/i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();

        await waitFor(() => {
            expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
        });
    });

    it('handles cancellation', async () => {
        const onCancel = vi.fn();
        const { user } = render(<EditCandidateForm {...defaultProps} onCancel={onCancel} />);

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await user.click(cancelButton);

        expect(onCancel).toHaveBeenCalled();
    });

    it('disables form controls during submission', async () => {
        const onSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
        const { user } = render(<EditCandidateForm {...defaultProps} onSave={onSave} />);

        const frontInput = screen.getByLabelText(/front/i);
        const backInput = screen.getByLabelText(/back/i);
        const submitButton = screen.getByRole('button', { name: /save changes/i });
        const cancelButton = screen.getByRole('button', { name: /cancel/i });

        await user.click(submitButton);

        await waitFor(() => {
            expect(frontInput).toBeDisabled();
            expect(backInput).toBeDisabled();
            expect(submitButton).toBeDisabled();
            expect(cancelButton).toBeDisabled();
        });
    });

    it('validates required fields', async () => {
        const { user } = render(<EditCandidateForm {...defaultProps} />);

        const frontInput = screen.getByLabelText(/front/i);
        const backInput = screen.getByLabelText(/back/i);
        const submitButton = screen.getByRole('button', { name: /save changes/i });

        await user.clear(frontInput);
        await user.clear(backInput);
        await user.click(submitButton);

        expect(frontInput).toBeInvalid();
        expect(backInput).toBeInvalid();
    });
}); 