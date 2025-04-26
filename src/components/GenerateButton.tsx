import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
  disabled: boolean;
}

export function GenerateButton({ onClick, isLoading, disabled }: GenerateButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} size="lg" className="min-w-[150px]">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Asking AI to generate flashcards...
        </>
      ) : (
        "Generate Flashcards"
      )}
    </Button>
  );
}
