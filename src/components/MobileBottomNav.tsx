import { useState, useEffect } from "react";
import { Library, FileEdit, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Panel } from "./ThreePanelLayout";
import { useAuth } from "./providers/AuthProvider";
import { toast } from "sonner";

interface MobileBottomNavProps {
  activePanel: Panel;
  onPanelChange: (panel: Panel) => void;
}

export function MobileBottomNav({ activePanel, onPanelChange }: MobileBottomNavProps) {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleCollectionsClick = () => {
    if (!user) {
      toast.warning("Please log in", {
        description: "You need to be logged in to view your collections."
      });
      return;
    }
    
    onPanelChange("collections");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background mobile-bottom-nav">
      <div className="grid grid-cols-3 h-16">
        <button
          className={cn(
            "flex flex-col items-center justify-center gap-1 p-2 transition-colors",
            activePanel === "collections" ? "text-primary" : "text-muted-foreground",
            !user && "opacity-50"
          )}
          onClick={handleCollectionsClick}
          aria-label="Collections"
          aria-current={activePanel === "collections" ? "page" : undefined}
          aria-disabled={!user}
        >
          <Library className="h-5 w-5" />
          <span className="text-xs">Collections</span>
        </button>

        <button
          className={cn(
            "flex flex-col items-center justify-center gap-1 p-2 transition-colors",
            activePanel === "builder" ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => onPanelChange("builder")}
          aria-label="Builder"
          aria-current={activePanel === "builder" ? "page" : undefined}
        >
          <FileEdit className="h-5 w-5" />
          <span className="text-xs">Builder</span>
        </button>
        
        <button
          className={cn(
            "flex flex-col items-center justify-center gap-1 p-2 transition-colors",
            activePanel === "learn" ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => onPanelChange("learn")}
          aria-label="Learn"
          aria-current={activePanel === "learn" ? "page" : undefined}
        >
          <Brain className="h-5 w-5" />
          <span className="text-xs">Learn</span>
        </button>
      </div>
    </div>
  );
}
