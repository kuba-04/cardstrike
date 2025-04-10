-- Migration: Add source_text to generations
-- Description: Adds source_text column to store input text for generation

ALTER TABLE public.generations
ADD COLUMN source_text text NOT NULL,
ADD COLUMN status varchar(20) NOT NULL DEFAULT 'pending';

-- Add check constraint for status values
ALTER TABLE public.generations
ADD CONSTRAINT generations_status_check 
CHECK (status IN ('pending', 'completed', 'failed')); 