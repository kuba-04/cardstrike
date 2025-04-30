import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { FlashcardDTO, GetFlashcardsResponseDTO } from "@/types";
import type { User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LogIn, PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EditFlashcardForm } from "./EditFlashcardForm";

interface FlashcardsListProps {
  initialUser?: Pick<User, "id" | "email">;
}

export function FlashcardsList({ initialUser }: FlashcardsListProps = {}) {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const queryClient = useQueryClient();

  const isDemo = !initialUser?.id;

  const { data, isLoading, error } = useQuery<GetFlashcardsResponseDTO>({
    queryKey: ["flashcards", page, limit],
    queryFn: async () => {
      // Don't make the API call if in demo mode
      if (isDemo) {
        throw new Error("Demo mode");
      }

      const response = await fetch(`/api/flashcards?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch flashcards");
      return response.json();
    },
    // Disable retries for demo mode errors
    retry: (failureCount, error) => {
      if (error.message === "Demo mode") return false;
      return failureCount < 2;
    },
  });

  const handleEdit = async (flashcard: FlashcardDTO, updateData: { front_text: string; back_text: string }) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      // Invalidate and refetch flashcards
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update flashcard";
      console.error(errorMessage);
      return Promise.reject(error);
    }
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

  const handleDelete = async (flashcard: FlashcardDTO) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      // Invalidate and refetch flashcards
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      toast.success("Flashcard deleted successfully");
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete flashcard";
      toast.error("Error", {
        description: "Failed to delete flashcard. Please try again.",
      });
      console.error(errorMessage);
      return Promise.reject(error);
    }
  };

  // Check if user is in demo mode
  if (isDemo) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">My Collections</h2>
          <Button asChild className="gap-2">
            <a href="/auth/login">
              <LogIn className="h-4 w-4" />
              Log in
            </a>
          </Button>
        </div>

        <Alert className="bg-blue-50 border-blue-200 mb-6">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You are in demo mode. You can generate flashcards once to try the app. Please log in to save your flashcards
            and view your collections.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-muted/30 border-dashed">
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px] text-center">
                <p className="text-muted-foreground">Your saved flashcards will appear here after you log in.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && error.message !== "Demo mode") {
    return <div className="text-center py-8 text-red-500">Error loading flashcards. Please try again later.</div>;
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">My Flashcards</h2>
          <Button asChild className="gap-2">
            <a href="/manual">
              <PlusCircle className="h-4 w-4" />
              Create New
            </a>
          </Button>
        </div>
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
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">My Flashcards</h2>
        <Button asChild className="gap-2">
          <a href="/manual">
            <PlusCircle className="h-4 w-4" />
            New
          </a>
        </Button>
      </div>

      {data?.flashcards.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>You don&apos;t have any flashcards yet. Create your first one!</p>
        </div>
      ) : (
        <>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 mb-8">
            {data?.flashcards.map((flashcard) => (
              <FlashcardItem 
                key={flashcard.id} 
                flashcard={flashcard} 
                onEdit={(updateData) => handleEdit(flashcard, updateData)}
                onHide={() => handleHide(flashcard)}
                onDelete={() => handleDelete(flashcard)}
              />
            ))}
          </div>

          {data && data.pagination.total > limit && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page * limit >= data.pagination.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface FlashcardItemProps {
  flashcard: FlashcardDTO;
  onEdit: (updateData: { front_text: string; back_text: string }) => Promise<void>;
  onHide: () => void;
  onDelete: () => void;
}

function FlashcardItem({ flashcard, onEdit, onHide, onDelete }: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Instead of using a dropdown menu, let's use a simple fixed position div
    const x = e.clientX;
    const y = e.clientY;
    
    setContextMenuPosition({ x, y });
    setContextMenuOpen(true);
    
    // Add a click event listener to close the menu when clicking outside
    const handleClickOutside = () => {
      setContextMenuOpen(false);
      window.removeEventListener('click', handleClickOutside);
    };
    
    // Use setTimeout to avoid immediate triggering of the click event
    setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
    }, 0);
    
    return false;
  };

  // Function to manually toggle the flip state
  const toggleFlip = () => {
    if (!isEditing) {
      setIsFlipped(!isFlipped);
    }
  };

  // Handler for delete with loading state
  const handleDeleteWithState = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler for starting edit mode
  const handleStartEdit = () => {
    setContextMenuOpen(false);
    setIsEditing(true);
  };

  // Handler for saving edits
  const handleSaveEdit = async (updateData: { front_text: string; back_text: string }) => {
    try {
      await onEdit(updateData);
      setIsEditing(false);
      toast.success("Flashcard updated successfully");
    } catch (error) {
      toast.error("Failed to update flashcard");
    }
  };

  // Handler for canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="relative">
      {/* Regular card that flips on click */}
      <div
        className={`flashcard-container relative w-full sm:max-w-[250px] md:max-w-[280px] xl:max-w-[300px] mx-auto overflow-hidden ${isEditing ? 'h-[400px]' : 'aspect-[4/3]'} ${isEditing ? '' : 'cursor-pointer'}`}
        onClick={isEditing ? undefined : toggleFlip}
        onKeyDown={isEditing ? undefined : handleKeyDown}
        onContextMenu={handleContextMenu}
        tabIndex={0}
        role="button"
        aria-label={`Flashcard: ${flashcard.front_text}`}
      >
        {isEditing ? (
          <Card className="w-full h-full" onClick={(e) => e.stopPropagation()}>
            <EditFlashcardForm
              flashcard={flashcard}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          </Card>
        ) : (
          <div className={`flashcard absolute inset-0 w-full h-full ${isFlipped ? "flipped" : ""}`}>
            {/* Front side */}
            <Card className="flashcard-front absolute inset-0 w-full h-full">
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center font-medium">{flashcard.front_text}</div>
                </div>
                {flashcard.is_ai && (
                  <div className="flex justify-end mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 0L14.59 5.41L20 8L14.59 10.59L12 16L9.41 10.59L4 8L9.41 5.41L12 0Z" />
                        <path d="M4 16L5.5 19.5L9 21L5.5 22.5L4 26L2.5 22.5L-1 21L2.5 19.5L4 16Z" />
                        <path d="M20 12L21.5 15.5L25 17L21.5 18.5L20 22L18.5 18.5L15 17L18.5 15.5L20 12Z" />
                      </svg>
                      AI
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Back side */}
            <Card className="flashcard-back absolute inset-0 w-full h-full">
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">{flashcard.back_text}</div>
                </div>
                {flashcard.is_ai && (
                  <div className="flex justify-end mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 0L14.59 5.41L20 8L14.59 10.59L12 16L9.41 10.59L4 8L9.41 5.41L12 0Z" />
                        <path d="M4 16L5.5 19.5L9 21L5.5 22.5L4 26L2.5 22.5L-1 21L2.5 19.5L4 16Z" />
                        <path d="M20 12L21.5 15.5L25 17L21.5 18.5L20 22L18.5 18.5L15 17L18.5 15.5L20 12Z" />
                      </svg>
                      AI
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Replace dropdown with fixed position div */}
      {contextMenuOpen && (
        <div 
          className="fixed bg-popover text-popover-foreground rounded-md shadow-md py-1 border border-border z-50"
          style={{
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
            minWidth: '150px'
          }}
        >
          <button 
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleStartEdit();
            }}
          >
            Edit
          </button>
          <button 
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onHide();
            }}
          >
            Hide
          </button>
          <button 
            className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteWithState();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
