import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Trash2 } from "lucide-react";
import type { CollectionWithStatsDTO } from "@/types";

interface CollectionCardProps {
  collection: CollectionWithStatsDTO;
  onClick: () => void;
  onDelete?: () => void; // Optional - only show delete button if provided
}

export function CollectionCard({ collection, onClick, onDelete }: CollectionCardProps) {
  const { name, stats } = collection;

  // Determine background color based on mastery level
  const colorClasses = {
    red: "bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 border-red-300 dark:border-red-800",
    yellow: "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-950 dark:hover:bg-yellow-900 border-yellow-300 dark:border-yellow-800",
    green: "bg-green-100 hover:bg-green-200 dark:bg-green-950 dark:hover:bg-green-900 border-green-300 dark:border-green-800",
    gray: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-700",
  };

  const colorClass = colorClasses[stats.mastery_color] || colorClasses.gray;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking delete
    onDelete?.(); // Call onDelete only if it's provided
  };

  return (
    <Card
      className={`cursor-pointer transition-colors ${colorClass} p-6 relative group`}
      onClick={onClick}
    >
      {/* Delete button - only show if onDelete is provided */}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <FolderOpen className="h-6 w-6 text-foreground/70" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{name}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                {stats.total_cards} card{stats.total_cards !== 1 ? "s" : ""}
              </div>
              {stats.due_cards > 0 && (
                <div className="font-medium text-foreground">
                  {stats.due_cards} due for review
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mastery indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              stats.mastery_color === "green"
                ? "bg-green-600 dark:bg-green-500"
                : stats.mastery_color === "yellow"
                  ? "bg-yellow-600 dark:bg-yellow-500"
                  : stats.mastery_color === "red"
                    ? "bg-red-600 dark:bg-red-500"
                    : "bg-gray-400 dark:bg-gray-600"
            }`}
            style={{
              width:
                stats.mastery_color === "gray"
                  ? "0%"
                  : stats.mastery_color === "green"
                    ? "100%"
                    : stats.mastery_color === "yellow"
                      ? "60%"
                      : "30%",
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground capitalize">
          {stats.mastery_color === "gray" ? "Not started" : stats.mastery_color}
        </span>
      </div>
    </Card>
  );
}
