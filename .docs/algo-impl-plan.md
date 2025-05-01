I'll analyze the SuperMemo algorithm and design an implementation plan for adding a "Learn" feature to your application.

Looking at the documentation, SuperMemo SM2 is a spaced repetition algorithm that helps users memorize content by showing cards at optimal intervals based on how well they recall the information.

Let me first explore the codebase to understand the current structure:

Ran tool
Let me check the types file to understand the data structures:

Read file: src/types.ts
Let me look at the components to understand the UI structure:

Ran tool
Let me check the db structure to understand how we might store learning data:

Ran tool
Let me check the navigation components to understand how to add a new tab:

Read file: src/components/Navbar.tsx

Read file: src/components/MobileBottomNav.tsx
Let me look at the database structure:

Read file: src/db/database.types.ts
Let me check for any existing flashcard components:

Ran tool
Based on my examination, I see that the database already has the necessary fields to implement the SuperMemo algorithm (`ease_factor`, `interval`, `last_review_at`, `next_review_at`, `repetition_count`). Now I'll design the implementation plan.

## Implementation Plan for SuperMemo Learning Feature

### 1. Data Model Updates

The existing database structure already includes most fields needed for the SuperMemo algorithm:

- `interval` (equivalent to SuperMemo's interval)
- `repetition_count` (equivalent to SuperMemo's repetition)
- `ease_factor` (equivalent to SuperMemo's efactor)
- `next_review_at` and `last_review_at` for scheduling

No database schema changes are required, but we need to ensure these fields are properly initialized and updated.

### 2. Core Algorithm Implementation

Create a utility module to implement the SuperMemo algorithm:

```typescript
// src/lib/supermemo.ts
export type SuperMemoGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface SuperMemoItem {
  interval: number;
  repetition: number;
  efactor: number;
}

export function supermemo(item: SuperMemoItem, grade: SuperMemoGrade): SuperMemoItem {
  // Implementation based on the SuperMemo 2 algorithm
  // We'll use the algorithm from the documentation

  let { interval, repetition, efactor } = item;

  // Calculate new efactor
  efactor = Math.max(1.3, efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

  // Update repetition and interval
  if (grade < 3) {
    repetition = 0;
    interval = 1;
  } else {
    repetition += 1;
    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
  }

  return { interval, repetition, efactor };
}

// Helper function to calculate next review date
export function getNextReviewDate(interval: number): Date {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate;
}
```

### 3. Backend API Updates

Add endpoints to:

1. Fetch cards due for review
2. Update card review status

```typescript
// src/pages/api/flashcards/due.ts
import type { APIRoute } from "astro";
import { supabaseServerClient } from "@/lib/supabase.server";

export const get: APIRoute = async ({ request, locals }) => {
  const supabase = supabaseServerClient(locals);

  const today = new Date().toISOString();

  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .or(`next_review_at.lte.${today},next_review_at.is.null`)
    .order("next_review_at", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ flashcards: data }), {
    status: 200,
  });
};
```

```typescript
// src/pages/api/flashcards/review.ts
import type { APIRoute } from "astro";
import { supabaseServerClient } from "@/lib/supabase.server";
import { supermemo, getNextReviewDate } from "@/lib/supermemo";

export const post: APIRoute = async ({ request, locals }) => {
  const supabase = supabaseServerClient(locals);

  const body = await request.json();
  const { id, grade } = body;

  // Get current flashcard data
  const { data: flashcard, error: fetchError } = await supabase.from("flashcards").select("*").eq("id", id).single();

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
    });
  }

  // Calculate new SuperMemo values
  const result = supermemo(
    {
      interval: flashcard.interval || 0,
      repetition: flashcard.repetition_count || 0,
      efactor: flashcard.ease_factor || 2.5,
    },
    grade
  );

  const nextReviewAt = getNextReviewDate(result.interval);

  // Update the flashcard
  const { data, error } = await supabase
    .from("flashcards")
    .update({
      interval: result.interval,
      repetition_count: result.repetition,
      ease_factor: result.efactor,
      last_review_at: new Date().toISOString(),
      next_review_at: nextReviewAt.toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ flashcard: data }), {
    status: 200,
  });
};
```

### 4. Frontend Components

#### 4.1. Navigation Updates

Update the navigation to include the "Learn" tab:

```typescript
// src/components/Navbar.tsx (update)
// Add import for the Brain icon from lucide-react
import { Library, FileEdit, Brain } from "lucide-react";

// Update the Panel type to include "learn"
// in src/components/ThreePanelLayout.tsx
export type Panel = "collections" | "builder" | "learn";

// Add a new button in the navbar
<Button
  variant="ghost"
  className={`flex items-center gap-2 ${activePanel === "learn" ? "text-primary" : "text-muted-foreground"}`}
  onClick={() => onPanelChange("learn")}
>
  <Brain className="h-4 w-4" />
  <span>Learn</span>
</Button>

// Also update MobileBottomNav.tsx similarly
```

#### 4.2. Learning UI Components

Create components for the learning experience:

```typescript
// src/components/learning/LearningCard.tsx
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { FlashcardDTO } from "@/types";
import type { SuperMemoGrade } from "@/lib/supermemo";

interface LearningCardProps {
  flashcard: FlashcardDTO;
  onGrade: (id: number, grade: SuperMemoGrade) => Promise<void>;
  onNext: () => void;
}

export function LearningCard({ flashcard, onGrade, onNext }: LearningCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleGrade = async (grade: SuperMemoGrade) => {
    setIsGrading(true);
    try {
      await onGrade(flashcard.id, grade);
      toast.success("Card graded successfully");
      setIsFlipped(false);
      onNext();
    } catch (error) {
      toast.error("Failed to grade card");
      console.error(error);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent
        className="p-6 min-h-[200px] flex items-center justify-center cursor-pointer"
        onClick={handleFlip}
      >
        <div className="text-xl text-center">
          {isFlipped ? flashcard.back_text : flashcard.front_text}
        </div>
      </CardContent>

      {isFlipped && (
        <CardFooter className="flex flex-wrap justify-center gap-2 p-4 border-t">
          <Button
            variant="destructive"
            size="sm"
            disabled={isGrading}
            onClick={() => handleGrade(0)}
            title="Complete blackout"
          >
            0
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isGrading}
            onClick={() => handleGrade(1)}
            title="Incorrect; remembered"
          >
            1
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isGrading}
            onClick={() => handleGrade(2)}
            title="Incorrect; easy to recall"
          >
            2
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isGrading}
            onClick={() => handleGrade(3)}
            title="Correct; difficult"
          >
            3
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isGrading}
            onClick={() => handleGrade(4)}
            title="Correct; with hesitation"
          >
            4
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={isGrading}
            onClick={() => handleGrade(5)}
            title="Perfect response"
          >
            5
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
```

```typescript
// src/components/learning/LearningView.tsx
import { useState, useEffect } from "react";
import { LearningCard } from "./LearningCard";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { FlashcardDTO } from "@/types";
import type { SuperMemoGrade } from "@/lib/supermemo";

export function LearningView() {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDueCards();
  }, []);

  const fetchDueCards = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/flashcards/due");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch cards");
      }

      setFlashcards(data.flashcards);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error fetching due cards:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to load cards");
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (id: number, grade: SuperMemoGrade) => {
    const response = await fetch("/api/flashcards/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, grade }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to save review");
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast.success("Learning session complete!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingIndicator size="lg" />
        <p className="mt-4 text-muted-foreground">Loading cards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-destructive">Error: {error}</p>
        <Button className="mt-4" onClick={fetchDueCards}>Retry</Button>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-center text-xl">No cards due for review!</p>
        <p className="text-center text-muted-foreground mt-2">
          All caught up. Check back later for more cards to review.
        </p>
      </div>
    );
  }

  if (currentIndex >= flashcards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-center text-xl">Learning session complete!</p>
        <p className="text-center text-muted-foreground mt-2">
          You've reviewed all {flashcards.length} cards.
        </p>
        <Button className="mt-4" onClick={fetchDueCards}>
          Check for more cards
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 text-sm text-muted-foreground text-center">
        Card {currentIndex + 1} of {flashcards.length}
      </div>

      <LearningCard
        flashcard={flashcards[currentIndex]}
        onGrade={handleGrade}
        onNext={handleNext}
      />

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Click the card to reveal the answer, then grade your response
        </p>
      </div>
    </div>
  );
}
```

### 5. Integration with Main Application

Update the main application to include the Learning panel:

```typescript
// src/pages/index.astro (or wherever the main layout is defined)
// Import the new LearningView component
import { LearningView } from "@/components/learning/LearningView";

// In the ThreePanelLayout component, add the new panel:
{activePanel === "learn" && (
  <LearningView />
)}
```

### 6. Initialize SuperMemo Data for Existing Cards

Create a script or endpoint to initialize SuperMemo data for existing cards:

```typescript
// src/pages/api/flashcards/initialize-learning.ts
import type { APIRoute } from "astro";
import { supabaseServerClient } from "@/lib/supabase.server";

export const post: APIRoute = async ({ request, locals }) => {
  const supabase = supabaseServerClient(locals);

  // Get all flashcards without SuperMemo data
  const { data: flashcards, error: fetchError } = await supabase.from("flashcards").select("id").is("interval", null);

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
    });
  }

  // Initialize SuperMemo data for each card
  const initialValues = {
    interval: 0,
    repetition_count: 0,
    ease_factor: 2.5,
    next_review_at: new Date().toISOString(),
  };

  const updates = flashcards.map((card) => supabase.from("flashcards").update(initialValues).eq("id", card.id));

  try {
    await Promise.all(updates);

    return new Response(
      JSON.stringify({
        message: `Initialized ${flashcards.length} cards for learning`,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to initialize cards",
      }),
      {
        status: 500,
      }
    );
  }
};
```

### 7. Statistics and Progress Tracking

Add a component to track learning progress:

```typescript
// src/components/learning/LearningStats.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export function LearningStats() {
  const [stats, setStats] = useState({
    dueToday: 0,
    learningCards: 0,
    masteredCards: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/flashcards/learning-stats");
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching learning stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">Due Today</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {loading ? (
            <LoadingIndicator size="sm" />
          ) : (
            <p className="text-2xl font-bold">{stats.dueToday}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">Learning</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {loading ? (
            <LoadingIndicator size="sm" />
          ) : (
            <p className="text-2xl font-bold">{stats.learningCards}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">Mastered</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {loading ? (
            <LoadingIndicator size="sm" />
          ) : (
            <p className="text-2xl font-bold">{stats.masteredCards}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {loading ? (
            <LoadingIndicator size="sm" />
          ) : (
            <p className="text-2xl font-bold">{stats.totalReviews}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

```typescript
// src/pages/api/flashcards/learning-stats.ts
import type { APIRoute } from "astro";
import { supabaseServerClient } from "@/lib/supabase.server";

export const get: APIRoute = async ({ request, locals }) => {
  const supabase = supabaseServerClient(locals);
  const today = new Date().toISOString();
  const userId = locals.user?.id;

  if (!userId) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
    });
  }

  try {
    // Get cards due today
    const { count: dueToday } = await supabase
      .from("flashcards")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .or(`next_review_at.lte.${today},next_review_at.is.null`);

    // Get cards in learning (repetition < 3)
    const { count: learningCards } = await supabase
      .from("flashcards")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .lt("repetition_count", 3)
      .not("repetition_count", "is", null);

    // Get mastered cards (repetition >= 3)
    const { count: masteredCards } = await supabase
      .from("flashcards")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .gte("repetition_count", 3);

    // Get total reviews (sum of repetitions)
    const { data: totalReviewsData } = await supabase
      .from("flashcards")
      .select("repetition_count")
      .eq("user_id", userId)
      .not("repetition_count", "is", null);

    const totalReviews = totalReviewsData?.reduce((sum, card) => sum + (card.repetition_count || 0), 0) || 0;

    return new Response(
      JSON.stringify({
        dueToday: dueToday || 0,
        learningCards: learningCards || 0,
        masteredCards: masteredCards || 0,
        totalReviews,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching learning stats:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch learning stats" }), {
      status: 500,
    });
  }
};
```

### 8. Testing Plan

1. Unit tests for the SuperMemo algorithm
2. API endpoint testing
3. UI component tests
4. Integration tests for the learning flow

## Implementation Sequence:

1. Create the `supermemo.ts` utility module
2. Update navigation components to include the "Learn" tab
3. Create backend API endpoints for fetching due cards and updating review status
4. Build the learning UI components
5. Create the statistics API and UI
6. Add an initialization endpoint for existing cards
7. Update the main application to integrate the new components
8. Write tests for all new components and functionality

This implementation follows all the project structure guidelines and integrates the SuperMemo algorithm into the existing flashcard application, adding a dedicated "Learn" tab for spaced repetition practice.
