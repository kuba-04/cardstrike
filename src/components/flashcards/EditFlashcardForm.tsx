import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { FlashcardDTO } from "@/types";

interface EditFlashcardFormProps {
  flashcard: FlashcardDTO;
  onSave: (updateData: { front_text: string; back_text: string }) => Promise<void>;
  onCancel: () => void;
}

export function EditFlashcardForm({ flashcard, onSave, onCancel }: EditFlashcardFormProps) {
  const [frontText, setFrontText] = useState(flashcard.front_text);
  const [backText, setBackText] = useState(flashcard.back_text);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        front_text: frontText,
        back_text: backText,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <CardContent className="flex-1 space-y-6 p-6 overflow-auto">
        <div className="space-y-2">
          <Label htmlFor="front-text" className="text-lg font-medium">Front</Label>
          <Textarea
            id="front-text"
            value={frontText}
            onChange={(e) => setFrontText(e.target.value)}
            placeholder="Front side of the flashcard"
            required
            disabled={isSaving}
            className="min-h-[120px] text-lg resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="back-text" className="text-lg font-medium">Back</Label>
          <Textarea
            id="back-text"
            value={backText}
            onChange={(e) => setBackText(e.target.value)}
            placeholder="Back side of the flashcard"
            required
            disabled={isSaving}
            className="min-h-[120px] text-lg resize-none"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between px-6 py-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSaving}
          className="px-8"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSaving}
          className="px-8"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </CardFooter>
    </form>
  );
} 