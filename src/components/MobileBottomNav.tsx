import { useState, useEffect } from "react";
import { Library, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Panel } from "./ThreePanelLayout";

interface MobileBottomNavProps {
  activePanel: Panel;
  onPanelChange: (panel: Panel) => void;
}

export function MobileBottomNav({ activePanel, onPanelChange }: MobileBottomNavProps) {
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background mobile-bottom-nav">
      <div className="grid grid-cols-2 h-16">
        <button
          className={cn(
            "flex flex-col items-center justify-center gap-1 p-2 transition-colors",
            activePanel === "collections" ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => onPanelChange("collections")}
          aria-label="Collections"
          aria-current={activePanel === "collections" ? "page" : undefined}
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
      </div>
    </div>
  );
}
