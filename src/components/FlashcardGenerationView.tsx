import { useEffect } from 'react';
import { toast } from 'sonner';
import { useFlashcardGeneration } from './hooks/useFlashcardGeneration';
import { TextInputArea } from './TextInputArea';
import { GenerateButton } from './GenerateButton';
import { CandidateReviewArea } from './CandidateReviewArea';
import { LoadingIndicator } from './ui/loading-indicator';

export function FlashcardGenerationView() {
    const {
        sourceText,
        setSourceText,
        generationId,
        candidates,
        isLoadingGeneration,
        isLoadingCompletion,
        isEditingCandidateId,
        error,
        generateFlashcards,
        rejectCandidate,
        updateCandidate,
        completeReview,
        startEditing,
        cancelEditing
    } = useFlashcardGeneration();

    // Handle error notifications
    useEffect(() => {
        if (error) {
            toast.error('Error', {
                description: error
            });
        }
    }, [error]);

    const handleGenerateClick = async () => {
        if (sourceText.length < 100 || sourceText.length > 10000) {
            toast.error('Invalid Input', {
                description: 'Text must be between 100 and 10,000 characters.'
            });
            return;
        }

        const promise = generateFlashcards();
        toast.promise(promise, {
            loading: 'Generating flashcards...',
            success: 'Flashcards generated successfully!',
            error: 'Failed to generate flashcards'
        });
    };

    const handleCompleteReview = async () => {
        const acceptedCount = candidates.filter(c =>
            c.local_status === 'pending' ||
            c.local_status === 'edited-saved'
        ).length;

        if (acceptedCount === 0) {
            toast.error('Cannot Complete Review', {
                description: 'At least one flashcard must be accepted.'
            });
            return;
        }

        const promise = completeReview();
        toast.promise(promise, {
            loading: 'Saving flashcards...',
            success: 'Flashcards have been saved successfully!',
            error: 'Failed to save flashcards'
        });
    };

    return (
        <div className="space-y-8">
            <TextInputArea
                value={sourceText}
                onChange={setSourceText}
                minLength={100}
                maxLength={10000}
                disabled={isLoadingGeneration || !!generationId}
            />

            <div className="flex justify-end">
                <GenerateButton
                    onClick={handleGenerateClick}
                    isLoading={isLoadingGeneration}
                    disabled={
                        sourceText.length < 100 ||
                        sourceText.length > 10000 ||
                        isLoadingGeneration ||
                        !!generationId
                    }
                />
            </div>

            {isLoadingGeneration && (
                <div className="flex justify-center">
                    <LoadingIndicator />
                </div>
            )}

            {candidates.length > 0 && (
                <CandidateReviewArea
                    candidates={candidates}
                    isLoadingCompletion={isLoadingCompletion}
                    isEditingCandidateId={isEditingCandidateId}
                    onRejectCandidate={rejectCandidate}
                    onUpdateCandidate={updateCandidate}
                    onStartEditing={startEditing}
                    onCancelEditing={cancelEditing}
                    onCompleteReview={handleCompleteReview}
                />
            )}
        </div>
    );
} 