import { useState } from 'react';
import type { 
  GenerateFlashcardCommand, 
  GenerateFlashcardResponseDTO,
  FlashcardCandidateDTO,
  UpdateFlashcardCandidateCommand,
  CompleteGenerationResponseDTO
} from '@/types';

export type CandidateWithLocalStatus = {
  candidate_id: string;
  front_text: string;
  back_text: string;
  original_front_text: string;
  original_back_text: string;
  local_status: 'pending' | 'edited-unsaved' | 'edited-saved' | 'rejected';
  is_saving_edit: boolean;
  is_rejecting: boolean;
};

export type UseFlashcardGenerationReturn = {
  sourceText: string;
  setSourceText: (text: string) => void;
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
};

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    
    if (response.status === 401) {
      throw new Error('Please sign in to continue');
    }
    
    // Use the error message from the API if available
    if (errorData?.error) {
      throw new Error(errorData.error);
    }

    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

export function useFlashcardGeneration(): UseFlashcardGenerationReturn {
  const [sourceText, setSourceText] = useState('');
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateWithLocalStatus[]>([]);
  const [isLoadingGeneration, setIsLoadingGeneration] = useState(false);
  const [isLoadingCompletion, setIsLoadingCompletion] = useState(false);
  const [isEditingCandidateId, setIsEditingCandidateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateFlashcards = async () => {
    try {
      setError(null);
      setIsLoadingGeneration(true);
      
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_text: sourceText } as GenerateFlashcardCommand)
      });

      const data = await handleApiResponse<GenerateFlashcardResponseDTO>(response);
      setGenerationId(data.generation_id);
      setCandidates(data.candidates.map(candidate => ({
        ...candidate,
        original_front_text: candidate.front_text,
        original_back_text: candidate.back_text,
        local_status: 'pending',
        is_saving_edit: false,
        is_rejecting: false
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoadingGeneration(false);
    }
  };

  const rejectCandidate = async (candidateId: string) => {
    try {
      setCandidates(prev => prev.map(c => 
        c.candidate_id === candidateId 
          ? { ...c, is_rejecting: true }
          : c
      ));

      const response = await fetch(`/api/flashcards/candidates/${candidateId}/reject`, {
        method: 'PUT'
      });

      await handleApiResponse(response);

      setCandidates(prev => prev.map(c => 
        c.candidate_id === candidateId 
          ? { ...c, local_status: 'rejected', is_rejecting: false }
          : c
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCandidates(prev => prev.map(c => 
        c.candidate_id === candidateId 
          ? { ...c, is_rejecting: false }
          : c
      ));
      throw err;
    }
  };

  const updateCandidate = async (candidateId: string, updateData: UpdateFlashcardCandidateCommand) => {
    try {
      setCandidates(prev => prev.map(c => 
        c.candidate_id === candidateId 
          ? { ...c, is_saving_edit: true }
          : c
      ));

      const response = await fetch(`/api/flashcards/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      await handleApiResponse(response);

      setCandidates(prev => prev.map(c => 
        c.candidate_id === candidateId 
          ? { 
              ...c, 
              front_text: updateData.front_text,
              back_text: updateData.back_text,
              local_status: 'edited-saved',
              is_saving_edit: false 
            }
          : c
      ));
      setIsEditingCandidateId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCandidates(prev => prev.map(c => 
        c.candidate_id === candidateId 
          ? { ...c, is_saving_edit: false }
          : c
      ));
      throw err;
    }
  };

  const completeReview = async () => {
    if (!generationId) return;

    try {
      setIsLoadingCompletion(true);
      const response = await fetch(`/api/flashcards/generations/${generationId}/complete`, {
        method: 'PUT'
      });

      await handleApiResponse<CompleteGenerationResponseDTO>(response);
      
      // Reset state after successful completion
      setSourceText('');
      setGenerationId(null);
      setCandidates([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    cancelEditing
  };
} 