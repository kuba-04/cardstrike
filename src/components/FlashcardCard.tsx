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
        // if (!confirm('Are you sure you want to delete this flashcard?')) {
        //     return;
        // }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/flashcards/${flashcard.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete flashcard');
            }
            // toast.success("Flashcard deleted successfully");
            onDelete();
        } catch (error) {
            toast.error("Error", {
                description: "Failed to delete flashcard. Please try again."
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const CardSide = ({ isAnswer = false }: { isAnswer?: boolean }) => (
        <Card className="grid grid-flow-col grid-rows-5 h-full">
            <CardHeader className="row-span-1 border-b">
                <div className="text-xs text-gray-500">{isAnswer ? 'Back' : 'Front'}</div>
            </CardHeader>
            <CardContent className="row-span-3">
                <div className="flex items-center justify-center h-full">
                    <p className="text-lg">{isAnswer ? flashcard.back_text : flashcard.front_text}</p>
                </div>
            </CardContent>
            <CardFooter className="row-span-1 border-t justify-between py-2">
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
        </Card>
    );

    return (
        <div
            className="cursor-pointer [perspective:1000px] relative w-full h-[250px]"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div
                className={`absolute inset-0 w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''
                    }`}
            >
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
                    <CardSide />
                </div>
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <CardSide isAnswer />
                </div>
            </div>
        </div>
    );
} 