import { useState } from "react";
import type { FlashcardDTO, GetFlashcardsResponseDTO } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export function FlashcardsList() {
    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    const { data, isLoading, error } = useQuery<GetFlashcardsResponseDTO>({
        queryKey: ["flashcards", page, limit],
        queryFn: async () => {
            const response = await fetch(`/api/flashcards?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error("Failed to fetch flashcards");
            return response.json();
        },
    });

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                Error loading flashcards. Please try again later.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardContent className="p-6">
                            <Skeleton className="h-4 w-3/4 mb-4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {data?.flashcards.map((flashcard) => (
                    <FlashcardItem key={flashcard.id} flashcard={flashcard} />
                ))}
            </div>

            {data && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        disabled={page * limit >= data.pagination.total}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

function FlashcardItem({ flashcard }: { flashcard: FlashcardDTO }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <Card
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <CardContent className="p-6">
                <div className="min-h-[100px] flex items-center justify-center text-center">
                    {isFlipped ? flashcard.back_text : flashcard.front_text}
                </div>
            </CardContent>
        </Card>
    );
} 