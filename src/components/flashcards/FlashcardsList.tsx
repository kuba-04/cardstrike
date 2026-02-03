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
import { CollectionsList } from "@/components/collections/CollectionsList";
import type { FlashcardDTO, GetFlashcardsResponseDTO } from "@/types";
import type { User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LogIn, PlusCircle, FolderOpen, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EditFlashcardForm } from "./EditFlashcardForm";

interface FlashcardsListProps {
  initialUser?: Pick<User, "id" | "email">;
}

export function FlashcardsList({ initialUser }: FlashcardsListProps = {}) {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [showCollectionsList, setShowCollectionsList] = useState(true);
  const queryClient = useQueryClient();

  const isDemo = !initialUser?.id;

  // Reset to collections view when collection is cleared
  useEffect(() => {
    if (selectedCollectionId === null) {
      setShowCollectionsList(true);
    }
  }, [selectedCollectionId]);

  const { data, isLoading, error } = useQuery<GetFlashcardsResponseDTO>({
    queryKey: ["flashcards", page, limit, selectedCollectionId],
    queryFn: async () => {
      // Don't make the API call if in demo mode
      if (isDemo) {
        throw new Error("Demo mode");
      }

      let url = `/api/flashcards?page=${page}&limit=${limit}`;
      if (selectedCollectionId) {
        url += `&collection_id=${selectedCollectionId}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch flashcards");
      return response.json();
    },
    // Disable retries for demo mode errors
    retry: (failureCount, error) => {
      if (error.message === "Demo mode") return false;
      return failureCount < 2;
    },
    // Only fetch when we have a selected collection
    enabled: !isDemo && selectedCollectionId !== null,
  });

  const handleSelectCollection = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
    setShowCollectionsList(false);
    setPage(1); // Reset to first page when changing collection
  };

  const handleBackToCollections = () => {
    setSelectedCollectionId(null);
    setShowCollectionsList(true);
  };

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

      await queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      toast.success("Flashcard updated");
    } catch (error) {
      console.error("Error updating flashcard:", error);
      toast.error("Failed to update flashcard");
    }
  };

  const handleHide = async (flashcard: FlashcardDTO) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front_text: flashcard.front_text,
          back_text: flashcard.back_text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to hide flashcard");
      }

      await queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      toast.success("Flashcard hidden");
    } catch (error) {
      console.error("Error hiding flashcard:", error);
      toast.error("Failed to hide flashcard");
    }
  };

  const handleDelete = async (flashcard: FlashcardDTO) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) {
      return;
    }

    try {
      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      await queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Flashcard deleted");
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast.error("Failed to delete flashcard");
    }
  };

  // Demo mode - show login prompt
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

  // Show collections list view
  if (showCollectionsList) {
    return (
      <div className="p-4">
        <CollectionsList onSelectCollection={handleSelectCollection} showDelete={true} showCreate={true} />
      </div>
    );
  }

  // Error state
  if (error && error.message !== "Demo mode") {
    return (
      <div className="p-4 space-y-4">
        <Button variant="ghost" onClick={handleBackToCollections}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>
        <div className="text-center py-8 text-red-500">Error loading flashcards. Please try again later.</div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={handleBackToCollections} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Flashcards</h2>
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

  // Flashcards view for selected collection
  return (
    <div className="p-4">
      <Button variant="ghost" onClick={handleBackToCollections} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Collections
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Flashcards</h2>
        <Button asChild className="gap-2">
          <a href="/manual">
            <PlusCircle className="h-4 w-4" />
            New
          </a>
        </Button>
      </div>

      {data?.flashcards.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No flashcards in this collection yet.</p>
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
              <span className="flex items-center px-4">
                Page {page} of {Math.ceil(data.pagination.total / limit)}
              </span>
              <Button
                variant="outline"
                disabled={page >= Math.ceil(data.pagination.total / limit)}
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
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenuOpen(false);
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenuOpen(false);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async (data: { front_text: string; back_text: string }) => {
    await onEdit(data);
    setIsEditing(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenuOpen(false);
    if (contextMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [contextMenuOpen]);

  if (isEditing) {
    return (
      <EditFlashcardForm
        flashcard={flashcard}
        onSave={handleSaveEdit}
        onCancel={handleCloseEdit}
      />
    );
  }

  return (
    <div className="relative group" onContextMenu={handleContextMenu}>
      <div
        className={`flashcard-container h-[200px] cursor-pointer ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped(!isFlipped)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard: ${flashcard.front_text}`}
      >
        <div className="flashcard w-full h-full relative">
          {/* Front side */}
          <Card className="flashcard-front absolute w-full h-full border-2">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center font-medium">{flashcard.front_text}</div>
              </div>
              <div className="flex justify-between items-end mt-2">
                {flashcard.is_ai && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1 ml-auto">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    AI
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Back side */}
          <Card className="flashcard-back absolute w-full h-full border-2">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">{flashcard.back_text}</div>
              </div>
              <div className="flex justify-between items-end mt-2">
                {flashcard.is_ai && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1 ml-auto">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    AI
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenuOpen && (
        <div
          className="fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
          }}
        >
          <button
            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={handleEditClick}
          >
            Edit
          </button>
          <button
            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}

      {/* Quick action buttons (visible on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
