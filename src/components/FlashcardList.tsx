import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { GetFlashcardsResponseDTO } from "../types";
import FlashcardCard from "./FlashcardCard";
import type { User } from "@supabase/supabase-js";

const ITEMS_PER_PAGE = 10;

interface FlashcardListProps {
  initialUser: Pick<User, "id" | "email">;
}

export default function FlashcardList({ initialUser }: FlashcardListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<GetFlashcardsResponseDTO>({
    queryKey: ["flashcards", currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/flashcards?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch flashcards");
      }
      return response.json();
    },
  });

  if (isError) {
    console.error("Error fetching flashcards:", error);
    toast.error("Error", {
      description: error instanceof Error ? error.message : "Failed to load flashcards. Please try again later.",
    });
    return <div className="text-center py-8 text-red-500">Failed to load flashcards. Please try again later.</div>;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  const { flashcards, pagination } = data!;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No flashcards found. Create your first flashcard to get started!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((flashcard) => (
          <FlashcardCard
            key={flashcard.id}
            flashcard={flashcard}
            onDelete={() => {
              // Invalidate and refetch flashcards
              queryClient.invalidateQueries({ queryKey: ["flashcards"] });
            }}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
