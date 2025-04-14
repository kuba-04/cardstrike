import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { FlashcardDTO } from '../types';

interface FlashcardCardProps {
    flashcard: FlashcardDTO;
    onDelete: () => void;
}

export default function FlashcardCard({ flashcard, onDelete }: FlashcardCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this flashcard?')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/flashcards/${flashcard.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete flashcard');
            }

            toast.success("Success!", {
                description: "Flashcard deleted successfully"
            });
            onDelete();
        } catch (error) {
            toast.error("Error", {
                description: "Failed to delete flashcard. Please try again."
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card
            className={`cursor-pointer transition-all duration-500 transform perspective-1000 ${isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`relative ${isFlipped ? 'hidden' : 'block'}`}>
                <CardHeader className="pb-3">
                    <div className="text-sm text-gray-500">Question</div>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">{flashcard.front_text}</p>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                    {flashcard.is_ai && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            AI Generated
                        </span>
                    )}
                </CardFooter>
            </div>

            <div className={`absolute inset-0 [transform:rotateY(180deg)] ${isFlipped ? 'block' : 'hidden'}`}>
                <CardHeader className="pb-3">
                    <div className="text-sm text-gray-500">Answer</div>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">{flashcard.back_text}</p>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                    {flashcard.is_ai && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            AI Generated
                        </span>
                    )}
                </CardFooter>
            </div>
        </Card>
    );
} 