-- Migration: Remove unique constraint on generation_id
-- Description: Removes the incorrect unique constraint on flashcards.generation_id

ALTER TABLE public.flashcards DROP CONSTRAINT IF EXISTS flashcards_generation_id_key; 