import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { FlashcardDTO } from "@/types";
import type { SuperMemoGrade } from "@/lib/supermemo";
import { cn } from "@/lib/utils";

interface LearningCardProps {
  flashcard: FlashcardDTO;
  onGrade: (id: string, grade: SuperMemoGrade) => Promise<void>;
  onNext: () => void;
  isLoading?: boolean;
}

export function LearningCard({ flashcard, onGrade, onNext, isLoading = false }: LearningCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  
  const handleFlip = () => {
    if (!isGrading && !isLoading) {
      setIsFlipped(!isFlipped);
    }
  };
  
  const handleGrade = async (grade: SuperMemoGrade) => {
    if (isGrading || isLoading) return;
    
    setIsGrading(true);
    try {
      await onGrade(flashcard.id, grade);
      toast.success("Response recorded");
      setIsFlipped(false);
      // Wait for flip animation to complete before moving to next card
      // The flip animation takes 0.6s (600ms) as defined in global.css
      setTimeout(() => {
        setIsGrading(false);
        onNext();
      }, 650); // 650ms to ensure animation fully completes
    } catch (error) {
      toast.error("Failed to record your response");
      console.error(error);
      setIsGrading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleFlip();
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className="flashcard-container relative w-full aspect-[4/3] cursor-pointer"
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Flashcard: ${flashcard.front_text}`}
      >
        <div className={`flashcard absolute inset-0 w-full h-full ${isFlipped ? "flipped" : ""}`}>
          {/* Front side */}
          <Card className="flashcard-front absolute inset-0 w-full h-full">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-xl font-medium">{flashcard.front_text}</div>
              </div>
            </CardContent>
          </Card>

          {/* Back side */}
          <Card className="flashcard-back absolute inset-0 w-full h-full">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-xl">{flashcard.back_text}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {isFlipped && (
        <div className="flex flex-wrap justify-center gap-2 p-4  mt-4">
          <GradeButton grade={0} onClick={handleGrade} disabled={isGrading || isLoading} title="Complete blackout" />
          <GradeButton grade={1} onClick={handleGrade} disabled={isGrading || isLoading} title="Incorrect; remembered" />
          <GradeButton grade={2} onClick={handleGrade} disabled={isGrading || isLoading} title="Incorrect; easy to recall" />
          <GradeButton grade={3} onClick={handleGrade} disabled={isGrading || isLoading} title="Correct; difficult" />
          <GradeButton grade={4} onClick={handleGrade} disabled={isGrading || isLoading} title="Correct; with hesitation" />
          <GradeButton grade={5} onClick={handleGrade} disabled={isGrading || isLoading} title="Perfect response" />
        </div>
      )}
    </div>
  );
}

interface GradeButtonProps {
  grade: SuperMemoGrade;
  onClick: (grade: SuperMemoGrade) => void;
  disabled?: boolean;
  title: string;
}

function GradeButton({ grade, onClick, disabled = false, title }: GradeButtonProps) {
  // Select button variant based on grade
  const getVariant = () => {
    if (grade === 0) return "destructive";
    if (grade === 5) return "default";
    return "outline";
  };
  
  return (
    <Button 
      variant={getVariant()} 
      size="sm" 
      disabled={disabled} 
      onClick={() => onClick(grade)}
      title={title}
      className={cn(
        "w-10 h-10 flex items-center justify-center",
        grade >= 3 && grade < 5 && "border-green-500",
        grade === 5 && "bg-green-600 hover:bg-green-700"
      )}
    >
      {grade}
    </Button>
  );
} 