import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FlashcardDTO, GetFlashcardsResponseDTO } from "@/types";
import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, LogIn, PlusCircle } from "lucide-react";
import { useState } from "react";

interface FlashcardsListProps {
  initialUser?: Pick<User, "id" | "email">;
}

export function FlashcardsList({ initialUser }: FlashcardsListProps = {}) {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

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
            Create New
          </a>
        </Button>
      </div>

      {data?.flashcards.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>You don't have any flashcards yet. Create your first one!</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {data?.flashcards.map((flashcard) => <FlashcardItem key={flashcard.id} flashcard={flashcard} />)}
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

function FlashcardItem({ flashcard }: { flashcard: FlashcardDTO }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="flashcard-container relative w-full aspect-[4/3] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`flashcard absolute inset-0 w-full h-full ${isFlipped ? "flipped" : ""}`}>
        {/* Front side */}
        <Card className="flashcard-front absolute inset-0 w-full h-full">
          <CardContent className="p-6 h-full flex items-center justify-center">
            <div className="text-center font-medium">{flashcard.front_text}</div>
          </CardContent>
        </Card>

        {/* Back side */}
        <Card className="flashcard-back absolute inset-0 w-full h-full">
          <CardContent className="p-6 h-full flex items-center justify-center">
            <div className="text-center">{flashcard.back_text}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
