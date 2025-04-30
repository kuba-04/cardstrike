import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { FlashcardDTO } from "@/types";
import type { SuperMemoGrade } from "@/lib/supermemo";
import { cn } from "@/lib/utils";

interface LearningCardProps {
  flashcard: FlashcardDTO;
  onGrade: (id: number, grade: SuperMemoGrade) => Promise<void>;
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
      onNext();
    } catch (error) {
      toast.error("Failed to record your response");
      console.error(error);
    } finally {
      setIsGrading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent 
        className={cn(
          "p-6 min-h-[200px] flex items-center justify-center cursor-pointer transition-all duration-300",
          (isGrading || isLoading) && "opacity-70 pointer-events-none"
        )}
        onClick={handleFlip}
      >
        <div className="text-xl text-center">
          {isFlipped ? flashcard.back_text : flashcard.front_text}
        </div>
      </CardContent>
      
      {isFlipped && (
        <CardFooter className="flex flex-wrap justify-center gap-2 p-4 border-t">
          <GradeButton grade={0} onClick={handleGrade} disabled={isGrading || isLoading} title="Complete blackout" />
          <GradeButton grade={1} onClick={handleGrade} disabled={isGrading || isLoading} title="Incorrect; remembered" />
          <GradeButton grade={2} onClick={handleGrade} disabled={isGrading || isLoading} title="Incorrect; easy to recall" />
          <GradeButton grade={3} onClick={handleGrade} disabled={isGrading || isLoading} title="Correct; difficult" />
          <GradeButton grade={4} onClick={handleGrade} disabled={isGrading || isLoading} title="Correct; with hesitation" />
          <GradeButton grade={5} onClick={handleGrade} disabled={isGrading || isLoading} title="Perfect response" />
        </CardFooter>
      )}
    </Card>
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