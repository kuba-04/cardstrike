-- Migration: Enable Row Level Security and Add Policies
-- Description: Enables RLS on all tables and adds appropriate access policies
-- Tables affected: flashcards, generation_error_logs, generations, users
-- Special considerations: Ensures data isolation between users while maintaining referential integrity

-- Enable RLS on all tables
alter table public.flashcards enable row level security;
alter table public.generation_error_logs enable row level security;
alter table public.generations enable row level security;
alter table public.users enable row level security;

-- Policies for flashcards table
create policy "Users can view their own flashcards"
    on public.flashcards
    for select
    using (auth.uid() = user_id);

create policy "Users can create their own flashcards"
    on public.flashcards
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on public.flashcards
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on public.flashcards
    for delete
    using (auth.uid() = user_id);

-- Policies for generation_error_logs table
create policy "Users can view their own error logs"
    on public.generation_error_logs
    for select
    using (auth.uid() = user_id);

create policy "Users can create error logs for themselves"
    on public.generation_error_logs
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own error logs"
    on public.generation_error_logs
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own error logs"
    on public.generation_error_logs
    for delete
    using (auth.uid() = user_id);

-- Policies for generations table
create policy "Users can view their own generations"
    on public.generations
    for select
    using (auth.uid() = user_id);

create policy "Users can create generations for themselves"
    on public.generations
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own generations"
    on public.generations
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own generations"
    on public.generations
    for delete
    using (auth.uid() = user_id);

-- Policies for users table
-- Note: Users should only be able to view and update their own profile
create policy "Users can view their own profile"
    on public.users
    for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.users
    for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Note: Insert and delete operations for users should be handled through auth.users
-- and appropriate triggers/functions, not directly through the users table 