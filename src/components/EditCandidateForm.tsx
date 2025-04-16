import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { CandidateWithLocalStatus } from './hooks/useFlashcardGeneration';
import type { UpdateFlashcardCandidateCommand } from '@/types';

interface EditCandidateFormProps {
    candidate: CandidateWithLocalStatus;
    onSave: (updateData: UpdateFlashcardCandidateCommand) => void;
    onCancel: () => void;
}

export function EditCandidateForm({
    candidate,
    onSave,
    onCancel
}: EditCandidateFormProps) {
    const [frontText, setFrontText] = useState(candidate.front_text);
    const [backText, setBackText] = useState(candidate.back_text);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({
                front_text: frontText,
                back_text: backText
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="front-text">Front</Label>
                    <Textarea
                        id="front-text"
                        value={frontText}
                        onChange={(e) => setFrontText(e.target.value)}
                        placeholder="Front side of the flashcard"
                        required
                        disabled={isSaving}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="back-text">Back</Label>
                    <Textarea
                        id="back-text"
                        value={backText}
                        onChange={(e) => setBackText(e.target.value)}
                        placeholder="Back side of the flashcard"
                        required
                        disabled={isSaving}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSaving}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </CardFooter>
        </form>
    );
} 