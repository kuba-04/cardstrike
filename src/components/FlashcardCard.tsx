import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { FlashcardDTO } from "../types";

interface FlashcardCardProps {
  flashcard: FlashcardDTO;
  onDelete: () => void;
  onEdit?: (flashcard: FlashcardDTO) => void;
  onHide?: (flashcard: FlashcardDTO) => void;
}

export default function FlashcardCard({ 
  flashcard, 
  onDelete,
  onEdit,
  onHide 
}: FlashcardCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Direct DOM method to attach context menu handler
  useEffect(() => {
    const cardElement = cardRef.current;
    
    if (!cardElement) return;
    
    const handleRawContextMenu = (e: MouseEvent) => {
      console.log("Raw context menu event captured");
      e.preventDefault();
      e.stopPropagation();
      
      setContextMenuPosition({ 
        x: e.clientX, 
        y: e.clientY 
      });
      
      setShowContextMenu(true);
      return false;
    };
    
    // Add the event listener directly to the DOM
    cardElement.addEventListener('contextmenu', handleRawContextMenu);
    
    // Clean up
    return () => {
      cardElement.removeEventListener('contextmenu', handleRawContextMenu);
    };
  }, []);

  const handleDelete = async () => {
    // if (!confirm('Are you sure you want to delete this flashcard?')) {
    //     return;
    // }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }
      // toast.success("Flashcard deleted successfully");
      onDelete();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete flashcard";
      toast.error("Error", {
        description: "Failed to delete flashcard. Please try again.",
      });
      console.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(flashcard);
    }
    setShowContextMenu(false);
  };

  const handleHide = () => {
    if (onHide) {
      onHide(flashcard);
    }
    setShowContextMenu(false);
  };

  // This syntax trick adds simple logging before React's synthetic events
  const handleReactContextMenu = (e: React.MouseEvent) => {
    alert("React context menu triggered"); // Use alert instead of console for visibility
    console.log("React context menu triggered");
    e.preventDefault();
    e.stopPropagation();
    
    // We'll rely on the direct DOM event listener for the actual handling
    return false;
  };

  // Add click listener to close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showContextMenu) {
        console.log("Closing context menu");
        setShowContextMenu(false);
      }
    };
    
    // Add event listener when the context menu is shown
    if (showContextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showContextMenu]);

  const CardSide = ({ isAnswer = false }: { isAnswer?: boolean }) => (
    <Card className="grid grid-flow-col grid-rows-5 h-full">
      <CardHeader className="row-span-1 border-b">
        <div className="text-xs text-gray-500">{isAnswer ? "Back" : "Front"}</div>
      </CardHeader>
      <CardContent className="row-span-3">
        <div className="flex items-center justify-center h-full">
          <p className="text-lg">{isAnswer ? flashcard.back_text : flashcard.front_text}</p>
        </div>
      </CardContent>
      <CardFooter className="row-span-1 border-t justify-between py-2">
        {flashcard.is_ai && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">AI Generated</span>}
      </CardFooter>
    </Card>
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div 
      className="relative" 
      ref={cardRef}
      onContextMenu={handleReactContextMenu}
    >
      <div
        className="cursor-pointer [perspective:1000px] relative w-full h-[250px] border-2 border-transparent hover:border-blue-200"
        onClick={() => setIsFlipped(!isFlipped)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Flashcard: ${flashcard.front_text}`}
      >
        <div
          className={`absolute inset-0 w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
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

      {showContextMenu && (
        <div 
          className="fixed z-50 bg-white rounded-md shadow-md border border-gray-200 py-1 min-w-32"
          style={{ 
            top: `${contextMenuPosition.y}px`, 
            left: `${contextMenuPosition.x}px` 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
            onClick={handleEdit}
          >
            Edit
          </div>
          <div 
            className="px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
            onClick={handleHide}
          >
            Hide
          </div>
          <div 
            className="px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer text-red-600"
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </div>
        </div>
      )}
    </div>
  );
}
