import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { toast } from "sonner";
import { useAuth } from "./providers/AuthProvider";
import { LoadingIndicator } from "./ui/loading-indicator";
import { Library, FileEdit } from "lucide-react";
import type { Panel } from "./ThreePanelLayout";
import { cn } from "@/lib/utils";

interface NavbarProps {
  activePanel?: Panel;
  onPanelChange?: (panel: Panel) => void;
  variant?: "default" | "with-nav";
}

export function Navbar({ activePanel, onPanelChange, variant = "default" }: NavbarProps = {}) {
  const { user, loading, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out");
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error(error instanceof Error ? error.message : "Failed to logout");
    }
  };

  const handleCollectionsClick = () => {
    if (!user) {
      toast.warning("Please log in", {
        description: "You need to be logged in to view your collections."
      });
      return;
    }
    
    onPanelChange?.("collections");
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center px-4">
        <div className="flex flex-1 items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            CardStrike
          </Link>

          {/* Navigation tabs - hidden on mobile, only shown in with-nav variant */}
          {variant === "with-nav" && onPanelChange && (
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center gap-2",
                  activePanel === "collections" ? "text-primary" : "text-muted-foreground",
                  !user && "opacity-50"
                )}
                onClick={handleCollectionsClick}
                aria-disabled={!user} 
              >
                <Library className="h-4 w-4" />
                <span>My Collections</span>
              </Button>
              <Button
                variant="ghost"
                className={`flex items-center gap-2 ${activePanel === "builder" ? "text-primary" : "text-muted-foreground"}`}
                onClick={() => onPanelChange("builder")}
              >
                <FileEdit className="h-4 w-4" />
                <span>Builder</span>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center">
          {loading ? (
            <LoadingIndicator />
          ) : user ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Log out"
            >
              Log out
            </Button>
          ) : (
            <Button
              variant="ghost"
              asChild
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Log in"
            >
              <Link href="/auth/login">Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
