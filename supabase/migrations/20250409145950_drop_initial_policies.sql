-- Migration: Disable Row Level Security
-- Description: Temporarily disables Row Level Security on tables

-- Disable RLS on tables
ALTER TABLE public.flashcards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_error_logs DISABLE ROW LEVEL SECURITY; 