import { useState, useEffect } from "react";
import { LearningCard } from "./LearningCard";
import { LearningStats } from "./LearningStats";
import { CollectionsList } from "@/components/collections/CollectionsList";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { toast } from "sonner";
import type { FlashcardDTO } from "@/types";
import type { SuperMemoGrade } from "@/lib/supermemo";
import { EmptyState } from "@/components/ui/empty-state";
import { RefreshCw, BookOpen, ArrowLeft } from "lucide-react";

export function LearningView() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When a collection is selected, fetch cards for that collection
  useEffect(() => {
    if (selectedCollectionId) {
      fetchDueCards(selectedCollectionId);
    }
  }, [selectedCollectionId]);

  const fetchDueCards = async (collectionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flashcards/due?collection_id=${collectionId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch due cards");
      }

      const data = await response.json();
      setFlashcards(data.flashcards);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error fetching due cards:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGrade = async (id: string, grade: SuperMemoGrade) => {
    setReviewLoading(true);
    
    try {
      const response = await fetch("/api/flashcards/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, grade }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save review");
      }
      
      // Optional: Update the local state based on the response
      // const data = await response.json();
      // Update flashcard stats locally if needed
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error recording grade:", error);
      throw error;
    } finally {
      setReviewLoading(false);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast.success("Learning session complete!", {
        description: "You've reviewed all cards for now.",
      });
    }
  };

  const handleBackToCollections = () => {
    setSelectedCollectionId(null);
    setFlashcards([]);
    setCurrentIndex(0);
    setError(null);
  };

  // Show collections list if no collection selected
  if (!selectedCollectionId) {
    return (
      <div className="p-4">
        <CollectionsList onSelectCollection={setSelectedCollectionId} />
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <LoadingIndicator className="mb-4" />
        <p className="text-muted-foreground">Loading cards due for review...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-4 space-y-4">
        <Button variant="ghost" onClick={handleBackToCollections}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>
        <EmptyState
          icon={<RefreshCw className="h-10 w-10 text-muted-foreground" />}
          title="Failed to load cards"
          description={error}
          action={
            <Button onClick={() => selectedCollectionId && fetchDueCards(selectedCollectionId)}>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }
  
  // No cards due
  if (flashcards.length === 0) {
    return (
      <div className="p-4 space-y-6">
        <Button variant="ghost" onClick={handleBackToCollections}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>

        <LearningStats />

        <EmptyState
          icon={<BookOpen className="h-10 w-10 text-muted-foreground" />}
          title="All caught up!"
          description="You have no cards due for review in this collection. Check back later or add more flashcards."
          action={
            <Button onClick={() => selectedCollectionId && fetchDueCards(selectedCollectionId)}>
              Check Again
            </Button>
          }
        />
      </div>
    );
  }
  
  // Session completed
  if (currentIndex >= flashcards.length) {
    return (
      <div className="p-4 space-y-6">
        <Button variant="ghost" onClick={handleBackToCollections}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>

        <LearningStats />

        <EmptyState
          icon={<BookOpen className="h-10 w-10 text-primary" />}
          title="Session Complete!"
          description={`You've reviewed all ${flashcards.length} cards due for now.`}
          action={
            <Button onClick={() => selectedCollectionId && fetchDueCards(selectedCollectionId)}>
              Check for More
            </Button>
          }
        />
      </div>
    );
  }
  
  // Active learning session
  return (
    <div className="p-4 space-y-6">
      <Button variant="ghost" onClick={handleBackToCollections}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Collections
      </Button>

      <LearningStats />

      <div className="mb-4 text-sm text-muted-foreground text-center">
        Card {currentIndex + 1} of {flashcards.length}
      </div>

      <LearningCard
        key={flashcards[currentIndex].id}
        flashcard={flashcards[currentIndex]}
        onGrade={handleGrade}
        onNext={handleNext}
        isLoading={reviewLoading}
      />

    </div>
  );
} 