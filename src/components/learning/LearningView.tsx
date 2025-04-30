import { useState, useEffect } from "react";
import { LearningCard } from "./LearningCard";
import { LearningStats } from "./LearningStats";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { toast } from "sonner";
import type { FlashcardDTO } from "@/types";
import type { SuperMemoGrade } from "@/lib/supermemo";
import { EmptyState } from "@/components/ui/empty-state";
import { RefreshCw, BookOpen } from "lucide-react";

export function LearningView() {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchDueCards();
  }, []);
  
  const fetchDueCards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/flashcards/due");
      
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
      toast.error("Failed to load cards");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGrade = async (id: number, grade: SuperMemoGrade) => {
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
      <EmptyState
        icon={<RefreshCw className="h-10 w-10 text-muted-foreground" />}
        title="Failed to load cards"
        description={error}
        action={
          <Button onClick={fetchDueCards}>Try Again</Button>
        }
      />
    );
  }
  
  // No cards due
  if (flashcards.length === 0) {
    return (
      <div className="p-4 space-y-6">
        <LearningStats />
        
        <EmptyState
          icon={<BookOpen className="h-10 w-10 text-muted-foreground" />}
          title="All caught up!"
          description="You have no cards due for review at the moment. Check back later or add more flashcards."
          action={
            <Button onClick={fetchDueCards}>Check Again</Button>
          }
        />
      </div>
    );
  }
  
  // Session completed
  if (currentIndex >= flashcards.length) {
    return (
      <div className="p-4 space-y-6">
        <LearningStats />
        
        <EmptyState
          icon={<BookOpen className="h-10 w-10 text-primary" />}
          title="Session Complete!"
          description={`You've reviewed all ${flashcards.length} cards due for now.`}
          action={
            <Button onClick={fetchDueCards}>Check for More</Button>
          }
        />
      </div>
    );
  }
  
  // Active learning session
  return (
    <div className="p-4 space-y-6">
      <LearningStats />
      
      <div className="mb-4 text-sm text-muted-foreground text-center">
        Card {currentIndex + 1} of {flashcards.length}
      </div>
      
      <LearningCard
        flashcard={flashcards[currentIndex]}
        onGrade={handleGrade}
        onNext={handleNext}
        isLoading={reviewLoading}
      />
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Click the card to reveal the answer, then grade your response
        </p>
      </div>
    </div>
  );
} 