import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingIndicator({ size = "md", className }: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)} data-testid="loading-indicator">
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-primary")} />
    </div>
  );
}
