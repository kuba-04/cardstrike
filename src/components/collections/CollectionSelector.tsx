import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FolderOpen, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CollectionDTO } from "@/types";

interface CollectionSelectorProps {
  selectedCollectionId: string | null;
  onSelectCollection: (collectionId: string | null) => void;
  disabled?: boolean;
  allowNull?: boolean; // Whether to allow "No Collection" option
}

export function CollectionSelector({
  selectedCollectionId,
  onSelectCollection,
  disabled = false,
  allowNull = true,
}: CollectionSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const queryClient = useQueryClient();

  // Fetch collections using React Query
  const { data: collectionsData, isLoading: loading } = useQuery<{ collections: CollectionDTO[] }>({
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

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      const data = await response.json();
      toast.success("Collection created successfully");

      // Invalidate collections query to refetch across all components
      await queryClient.invalidateQueries({ queryKey: ["collections"] });

      // Close dialog and reset form first
      setShowCreateDialog(false);
      setNewCollectionName("");

      // Auto-select the new collection if the handler is provided
      if (onSelectCollection) {
        onSelectCollection(data.collection.id);
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create collection");
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled || loading}
              className="flex-1 justify-between"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>
                  {loading
                    ? "Loading..."
                    : selectedCollection
                      ? selectedCollection.name
                      : allowNull
                        ? "No Collection"
                        : "Select Collection"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[250px]">
            {allowNull && (
              <DropdownMenuItem onClick={() => onSelectCollection(null)}>
                <span className="text-muted-foreground">No Collection</span>
              </DropdownMenuItem>
            )}
            {collections.map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                onClick={() => onSelectCollection(collection.id)}
              >
                {collection.name}
              </DropdownMenuItem>
            ))}
            {collections.length === 0 && !loading && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No collections yet
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowCreateDialog(true)}
          disabled={disabled || isCreating}
          title="Create new collection"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Create Collection Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateDialog(false)}>
          <div 
            className="bg-white dark:bg-gray-950 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Create New Collection</h2>
            
            <form onSubmit={handleCreateCollection} className="space-y-4">
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
    </div>
  );
}
