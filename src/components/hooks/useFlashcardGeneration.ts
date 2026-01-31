import { useState } from "react";
import type {
  GenerateFlashcardCommand,
  GenerateFlashcardResponseDTO,
  FlashcardCandidateDTO,
  UpdateFlashcardCandidateCommand,
  CompleteGenerationResponseDTO,
} from "../../types";
import { handleApiResponse } from "../../lib/api-utils";
import { useDemoSession } from "./useDemoSession";
import { toast } from "sonner";

export interface CandidateWithLocalStatus {
  candidate_id: string;
  front_text: string;
  back_text: string;
  original_front_text: string;
  original_back_text: string;
  local_status: "pending" | "edited-unsaved" | "edited-saved" | "rejected";
  is_saving_edit: boolean;
  is_rejecting: boolean;
}

export interface UseFlashcardGenerationReturn {
  sourceText: string;
  setSourceText: (text: string) => void;
  frontLanguage: string;
  setFrontLanguage: (language: string) => void;
  backLanguage: string;
  setBackLanguage: (language: string) => void;
  generationId: string | null;
  candidates: CandidateWithLocalStatus[];
  isLoadingGeneration: boolean;
  isLoadingCompletion: boolean;
  isEditingCandidateId: string | null;
  error: string | null;
  generateFlashcards: () => Promise<void>;
  rejectCandidate: (candidateId: string) => Promise<void>;
  updateCandidate: (candidateId: string, updateData: UpdateFlashcardCandidateCommand) => Promise<void>;
  completeReview: () => Promise<void>;
  startEditing: (candidateId: string) => void;
  cancelEditing: () => void;
}

export function useFlashcardGeneration(): UseFlashcardGenerationReturn {
  const [sourceText, setSourceText] = useState("");
  const [frontLanguage, setFrontLanguage] = useState("");
  const [backLanguage, setBackLanguage] = useState("English");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateWithLocalStatus[]>([]);
  const [isLoadingGeneration, setIsLoadingGeneration] = useState(false);
  const [isLoadingCompletion, setIsLoadingCompletion] = useState(false);
  const [isEditingCandidateId, setIsEditingCandidateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { hasUsedGeneration, markGenerationUsed, isDemo } = useDemoSession();

  const generateFlashcards = async () => {
    try {
      // Check if demo user has already generated
      if (isDemo && hasUsedGeneration) {
        toast.error("Demo Limit Reached", {
          description: "Please log in to generate more flashcards. Demo users are limited to one generation.",
        });
        return;
      }

      setError(null);
      setIsLoadingGeneration(true);

      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_text: sourceText,
          front_language: frontLanguage || undefined,
          back_language: backLanguage || undefined,
        } as GenerateFlashcardCommand),
      });

      const data = await handleApiResponse<GenerateFlashcardResponseDTO>(response);

      // Mark demo generation as used if successful
      if (isDemo) {
        markGenerationUsed();
        toast.info("Demo Mode", {
          description: "Your flashcards will not be saved. Please log in to save and manage your flashcards.",
        });
      }

      setGenerationId(data.generation_id);
      setCandidates(
        data.candidates.map((candidate: FlashcardCandidateDTO) => ({
          ...candidate,
          original_front_text: candidate.front_text,
          original_back_text: candidate.back_text,
          local_status: "pending",
          is_saving_edit: false,
          is_rejecting: false,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoadingGeneration(false);
    }
  };

  const rejectCandidate = async (candidateId: string) => {
    try {
      setCandidates((prev) => prev.map((c) => (c.candidate_id === candidateId ? { ...c, is_rejecting: true } : c)));

      // For demo users, just update the local state without API calls
      if (isDemo) {
        setTimeout(() => {
          setCandidates((prev) =>
            prev.map((c) =>
              c.candidate_id === candidateId ? { ...c, local_status: "rejected", is_rejecting: false } : c
            )
          );
        }, 300); // Add a small delay to simulate API call
        return;
      }

      const response = await fetch(`/api/flashcards/candidates/${candidateId}/reject`, {
        method: "PUT",
      });

      await handleApiResponse(response);

      setCandidates((prev) =>
        prev.map((c) => (c.candidate_id === candidateId ? { ...c, local_status: "rejected", is_rejecting: false } : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCandidates((prev) => prev.map((c) => (c.candidate_id === candidateId ? { ...c, is_rejecting: false } : c)));
      throw err;
    }
  };

  const updateCandidate = async (candidateId: string, updateData: UpdateFlashcardCandidateCommand) => {
    try {
      setCandidates((prev) => prev.map((c) => (c.candidate_id === candidateId ? { ...c, is_saving_edit: true } : c)));

      // For demo users, just update the local state without API calls
      if (isDemo) {
        setTimeout(() => {
          setCandidates((prev) =>
            prev.map((c) =>
              c.candidate_id === candidateId
                ? {
                    ...c,
                    front_text: updateData.front_text,
                    back_text: updateData.back_text,
                    local_status: "edited-saved",
                    is_saving_edit: false,
                  }
                : c
            )
          );
          setIsEditingCandidateId(null);
        }, 300); // Add a small delay to simulate API call
        return;
      }

      const response = await fetch(`/api/flashcards/candidates/${candidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      await handleApiResponse(response);

      setCandidates((prev) =>
        prev.map((c) =>
          c.candidate_id === candidateId
            ? {
                ...c,
                front_text: updateData.front_text,
                back_text: updateData.back_text,
                local_status: "edited-saved",
                is_saving_edit: false,
              }
            : c
        )
      );
      setIsEditingCandidateId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCandidates((prev) => prev.map((c) => (c.candidate_id === candidateId ? { ...c, is_saving_edit: false } : c)));
      throw err;
    }
  };

  const completeReview = async () => {
    if (!generationId) return;

    try {
      setIsLoadingCompletion(true);

      // For demo users, just clear the state without saving
      if (isDemo) {
        toast.success("Demo Complete", {
          description: "In demo mode, flashcards are not saved. Log in to save and manage your flashcards!",
        });
        setSourceText("");
        setFrontLanguage("");
        setBackLanguage("English");
        setGenerationId(null);
        setCandidates([]);
        return;
      }

      const response = await fetch(`/api/flashcards/generations/${generationId}/complete`, {
        method: "PUT",
      });

      await handleApiResponse<CompleteGenerationResponseDTO>(response);

      // Reset state after successful completion
      setSourceText("");
      setFrontLanguage("");
      setBackLanguage("English");
      setGenerationId(null);
      setCandidates([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoadingCompletion(false);
    }
  };

  const startEditing = (candidateId: string) => {
    setIsEditingCandidateId(candidateId);
  };

  const cancelEditing = () => {
    setIsEditingCandidateId(null);
  };

  return {
    sourceText,
    setSourceText,
    frontLanguage,
    setFrontLanguage,
    backLanguage,
    setBackLanguage,
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
  };
}
