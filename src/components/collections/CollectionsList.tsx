import { useState } from "react";
import { CollectionCard } from "./CollectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CollectionWithStatsDTO } from "@/types";

interface CollectionsListProps {
  onSelectCollection: (collectionId: string) => void;
  showDelete?: boolean; // Optional - controls whether delete button is shown
  showCreate?: boolean; // Optional - controls whether create button is shown
}

export function CollectionsList({ onSelectCollection, showDelete = false, showCreate = false }: CollectionsListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch collections using React Query
  const {
    data: collectionsData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<{ collections: CollectionWithStatsDTO[] }>({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch("/api/collections");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch collections");
      }
      return response.json();
    },
  });

  const collections = collectionsData?.collections || [];
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Unknown error") : null;

  const handleCreateCollection = async () => {
    const trimmedName = newCollectionName.trim();
    if (!trimmedName) {
      toast.error("Collection name cannot be empty");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create collection");
      }

      toast.success("Collection created successfully");
      
      // Invalidate collections query to refetch
      await queryClient.invalidateQueries({ queryKey: ["collections"] });

      // Close dialog and reset form
      setShowCreateDialog(false);
      setNewCollectionName("");
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create collection");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    if (!confirm(`Are you sure you want to delete "${collectionName}"? All flashcards in this collection will be moved to "No Collection".`)) {
      return;
    }

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete collection");
      }

      toast.success("Collection deleted successfully");
      
      // Invalidate both collections and flashcards queries
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      await queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete collection");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <LoadingIndicator className="mb-4" />
        <p className="text-muted-foreground">Loading collections...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={<FolderOpen className="h-10 w-10 text-muted-foreground" />}
        title="Failed to load collections"
        description={error}
        action={<Button onClick={() => refetch()}>Try Again</Button>}
      />
    );
  }

  // Empty state
  if (collections.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpen className="h-10 w-10 text-muted-foreground" />}
        title="No collections yet"
        description="Create your first collection to organize your flashcards"
        action={
          showCreate ? (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          ) : undefined
        }
      />
    );
  }

  // Collections grid
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Your Collections</h2>
          {showCreate && (
            <Button onClick={() => setShowCreateDialog(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onClick={() => onSelectCollection(collection.id)}
              {...(showDelete && { onDelete: () => handleDeleteCollection(collection.id, collection.name) })}
            />
          ))}
        </div>
      </div>

      {/* Create Collection Dialog - only render if showCreate is true */}
      {showCreate && showCreateDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" 
          onClick={() => setShowCreateDialog(false)}
        >
          <div 
            className="bg-white dark:bg-gray-950 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Create New Collection</h2>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateCollection();
              }} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input
                  id="collection-name"
                  type="text"
                  placeholder="e.g., Cooking"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  autoFocus
                  maxLength={100}
                  disabled={isCreating}
                />
                <p className="text-xs text-muted-foreground">
                  Choose a descriptive name for your flashcard collection
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setNewCollectionName("");
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !newCollectionName.trim()}>
                  {isCreating ? "Creating..." : "Create Collection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
