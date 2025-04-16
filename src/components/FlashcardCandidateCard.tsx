import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Loader2, Pencil, X } from 'lucide-react';
import type { CandidateWithLocalStatus } from './hooks/useFlashcardGeneration';
import type { UpdateFlashcardCandidateCommand } from '@/types';
import { EditCandidateForm } from '@/components/EditCandidateForm';

interface FlashcardCandidateCardProps {
    candidate: CandidateWithLocalStatus;
    isEditing: boolean;
    onReject: () => void;
    onUpdate: (updateData: UpdateFlashcardCandidateCommand) => void;
    onStartEditing: () => void;
    onCancelEditing: () => void;
}

export function FlashcardCandidateCard({
    candidate,
    isEditing,
    onReject,
    onUpdate,
    onStartEditing,
    onCancelEditing
}: FlashcardCandidateCardProps) {
    const isRejected = candidate.local_status === 'rejected';
    const isEdited = candidate.local_status === 'edited-saved';

    return (
        <Card className={isRejected ? 'opacity-50' : ''} data-testid="flashcard-candidate">
            {isEditing ? (
                <EditCandidateForm
                    candidate={candidate}
                    onSave={onUpdate}
                    onCancel={onCancelEditing}
                />
            ) : (
                <>
                    <CardHeader className="space-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-lg font-medium">Front</h3>
                                <p className="text-sm text-muted-foreground">
                                    {candidate.front_text}
                                </p>
                            </div>
                            {!isRejected && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={onStartEditing}
                                        disabled={candidate.is_saving_edit}
                                        aria-label="Edit flashcard"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={onReject}
                                        disabled={candidate.is_rejecting}
                                        aria-label="Reject flashcard"
                                    >
                                        {candidate.is_rejecting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <X className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium">Back</h3>
                            <p className="text-sm text-muted-foreground">
                                {candidate.back_text}
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <p className="text-xs text-muted-foreground">
                            {isRejected && 'Rejected'}
                            {isEdited && 'Edited'}
                            {!isRejected && !isEdited && 'Original'}
                        </p>
                    </CardFooter>
                </>
            )}
        </Card>
    );
} 