import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { FlashcardDTO, GetFlashcardsResponseDTO } from "../types";
import FlashcardCard from "./FlashcardCard";

const ITEMS_PER_PAGE = 10;

// No props needed, so we can export directly without an interface
export default function FlashcardList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDTO | null>(null);
  const queryClient = useQueryClient();

  // Debug: Global context menu detection
  useEffect(() => {
    const debugContextMenu = (e: MouseEvent) => {
      if (e.button === 2) { // Right click
        console.log("RIGHT CLICK DETECTED AT LIST LEVEL", { x: e.clientX, y: e.clientY });
      }
    };
    
    document.addEventListener('mousedown', debugContextMenu);
    
    return () => {
      document.removeEventListener('mousedown', debugContextMenu);
    };
  }, []);

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

  const handleEdit = async (flashcard: FlashcardDTO) => {
    setEditingFlashcard(flashcard);
    // TODO: Open edit modal or navigate to edit page
    toast.info("Edit functionality coming soon!");
  };

  const handleHide = async (flashcard: FlashcardDTO) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcard.id}/hide`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hidden: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to hide flashcard");
      }

      // Invalidate and refetch flashcards
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      toast.success("Flashcard hidden successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to hide flashcard";
      toast.error("Error", {
        description: "Failed to hide flashcard. Please try again.",
      });
      console.error(errorMessage);
    }
  };

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

  // Safely handle the case where data might be undefined
  if (!data) {
    return <div className="text-center py-8 text-gray-500">No data available.</div>;
  }

  const { flashcards, pagination } = data;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No flashcards found. Create your first flashcard to get started!
      </div>
    );
  }

  const handleRightClick = (e: React.MouseEvent) => {
    console.log("RIGHT CLICK ON LIST CONTAINER");
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div className="space-y-6" onContextMenu={handleRightClick}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((flashcard) => (
          <FlashcardCard
            key={flashcard.id}
            flashcard={flashcard}
            onDelete={() => {
              // Invalidate and refetch flashcards
              queryClient.invalidateQueries({ queryKey: ["flashcards"] });
            }}
            onEdit={handleEdit}
            onHide={handleHide}
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
