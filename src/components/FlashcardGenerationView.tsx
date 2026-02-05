import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { CandidateReviewArea } from "./CandidateReviewArea";
import { GenerateButton } from "./GenerateButton";
import { LanguageSelector } from "./LanguageSelector";
import { CollectionSelector } from "./collections/CollectionSelector";
import { useDemoSession } from "./hooks/useDemoSession";
import { useFlashcardGeneration } from "./hooks/useFlashcardGeneration";
import { TextInputArea } from "./TextInputArea";
import { Alert, AlertDescription } from "./ui/alert";
import { LoadingIndicator } from "./ui/loading-indicator";

export function FlashcardGenerationView() {
  const {
    sourceText,
    setSourceText,
    frontLanguage,
    setFrontLanguage,
    backLanguage,
    setBackLanguage,
    collectionId,
    setCollectionId,
    generationId,
    candidates,
    isLoadingGeneration,
    isLoadingCompletion,
    isEditingCandidateId,
    error,
    generateFlashcards,
    rejectCandidate,
    updateCandidate,
    completeReview,
    startEditing,
    cancelEditing,
  } = useFlashcardGeneration();

  const { isDemo } = useDemoSession();

  const handleGenerateClick = async () => {
    if (sourceText.length < 100 || sourceText.length > 10000) {
      toast.error("Invalid Input", {
        description: "Text must be between 100 and 10,000 characters.",
      });
      return;
    }

    try {
      await generateFlashcards();
      toast.success("Success", {
        description: "Flashcards generated successfully!",
      });
    } catch (error) {
      // Don't show a toast here as the error state will trigger the useEffect error handler
      console.error("Generation error:", error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Handle error notifications
  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: error, // Use the error message directly from the API
      });
    }
  }, [error]);

  const handleCompleteReview = async () => {
    const acceptedCount = candidates.filter(
      (c) => c.local_status === "pending" || c.local_status === "edited-saved"
    ).length;

    if (acceptedCount === 0) {
      toast.error("Cannot Complete Review", {
        description: "At least one flashcard must be accepted.",
      });
      return;
    }

    const promise = completeReview();
    toast.promise(promise, {
      loading: "Saving flashcards...",
      success: "Flashcards have been saved successfully!",
      error: "Failed to save flashcards",
    });

    window.location.href = "/flashcards";
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto px-4 py-8">
      {isDemo && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You are in demo mode. You can generate flashcards once to try the app. Please log in to save your flashcards
            and use all features.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Generate Flashcards</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Collection</label>
          <CollectionSelector
            selectedCollectionId={collectionId}
            onSelectCollection={setCollectionId}
            disabled={isLoadingGeneration || !!generationId}
            allowNull={true}
          />
        </div>

        <LanguageSelector
          frontLanguage={frontLanguage}
          backLanguage={backLanguage}
          onFrontLanguageChange={setFrontLanguage}
          onBackLanguageChange={setBackLanguage}
          disabled={isLoadingGeneration || !!generationId}
        />
      </div>

      <TextInputArea
        value={sourceText}
        onChange={setSourceText}
        minLength={100}
        maxLength={10000}
        disabled={isLoadingGeneration || !!generationId}
      />

      <div className="flex justify-end">
        <GenerateButton
          onClick={handleGenerateClick}
          isLoading={isLoadingGeneration}
          disabled={sourceText.length < 100 || sourceText.length > 10000 || isLoadingGeneration || !!generationId}
        />
      </div>

      {isLoadingGeneration && (
        <div className="flex justify-center">
          <LoadingIndicator />
        </div>
      )}

      {candidates.length > 0 && (
        <CandidateReviewArea
          candidates={candidates}
          isLoadingCompletion={isLoadingCompletion}
          isEditingCandidateId={isEditingCandidateId}
          isDemo={isDemo}
          onRejectCandidate={rejectCandidate}
          onUpdateCandidate={updateCandidate}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onCompleteReview={handleCompleteReview}
        />
      )}
    </div>
  );
}
