import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { CandidateWithLocalStatus } from './hooks/useFlashcardGeneration';
import { FlashcardCandidateCard } from '@/components/FlashcardCandidateCard';
import type { UpdateFlashcardCandidateCommand } from '@/types';

interface CandidateReviewAreaProps {
    candidates: CandidateWithLocalStatus[];
    isLoadingCompletion: boolean;
    isEditingCandidateId: string | null;
    onRejectCandidate: (candidateId: string) => Promise<void>;
    onUpdateCandidate: (candidateId: string, updateData: UpdateFlashcardCandidateCommand) => Promise<void>;
    onStartEditing: (candidateId: string) => void;
    onCancelEditing: () => void;
    onCompleteReview: () => Promise<void>;
}

export function CandidateReviewArea({
    candidates,
    isLoadingCompletion,
    isEditingCandidateId,
    onRejectCandidate,
    onUpdateCandidate,
    onStartEditing,
    onCancelEditing,
    onCompleteReview
}: CandidateReviewAreaProps) {
    const acceptedCount = candidates.filter(c =>
        c.local_status === 'pending' ||
        c.local_status === 'edited-saved'
    ).length;

    const rejectedCount = candidates.filter(c =>
        c.local_status === 'rejected'
    ).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Review Generated Flashcards
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {acceptedCount} accepted · {rejectedCount} rejected · {candidates.length} total
                    </p>
                </div>
                <Button
                    onClick={onCompleteReview}
                    disabled={isLoadingCompletion || acceptedCount === 0 || isEditingCandidateId !== null}
                    size="lg"
                >
                    {isLoadingCompletion ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Complete Review'
                    )}
                </Button>
            </div>

            <div className="grid gap-4">
                {candidates.map((candidate) => (
                    <FlashcardCandidateCard
                        key={candidate.candidate_id}
                        candidate={candidate}
                        isEditing={candidate.candidate_id === isEditingCandidateId}
                        onReject={() => onRejectCandidate(candidate.candidate_id)}
                        onUpdate={(updateData) => onUpdateCandidate(candidate.candidate_id, updateData)}
                        onStartEditing={() => onStartEditing(candidate.candidate_id)}
                        onCancelEditing={onCancelEditing}
                    />
                ))}
            </div>
        </div>
    );
} 