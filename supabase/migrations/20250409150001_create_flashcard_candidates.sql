-- Migration: Create flashcard_candidates table
-- Description: Creates table for storing generated flashcard candidates before acceptance

CREATE TABLE public.flashcard_candidates (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    generation_id bigint NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
    front_content varchar(200) NOT NULL,
    back_content varchar(200) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add check constraint for status values
ALTER TABLE public.flashcard_candidates
ADD CONSTRAINT flashcard_candidates_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Create index for faster lookups
CREATE INDEX idx_flashcard_candidates_user_id ON flashcard_candidates(user_id);
CREATE INDEX idx_flashcard_candidates_generation_id ON flashcard_candidates(generation_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON flashcard_candidates
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at(); 