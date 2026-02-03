-- Migration: Add Collections Feature
-- Description: Creates collections table for organizing flashcards and adds collection_id to flashcards table

-- Create collections table
create table collections (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    name varchar(100) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint unique_collection_name_per_user unique(user_id, name)
);

-- Add RLS policies for collections
alter table collections enable row level security;

create policy "Users can view their own collections"
    on collections for select
    using (auth.uid() = user_id);

create policy "Users can create their own collections"
    on collections for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own collections"
    on collections for update
    using (auth.uid() = user_id);

create policy "Users can delete their own collections"
    on collections for delete
    using (auth.uid() = user_id);

-- Add updated_at trigger for collections
create trigger set_updated_at
    before update on collections
    for each row
    execute function handle_updated_at();

-- Add index for collections
create index idx_collections_user_id on collections(user_id);

-- Add collection_id column to flashcards table
alter table flashcards 
    add column collection_id uuid references collections(id) on delete set null;

-- Add index for filtering flashcards by collection
create index idx_flashcards_collection_id on flashcards(collection_id);

-- Add collection_id column to generations table (optional, to remember which collection the generation is for)
alter table generations
    add column collection_id uuid references collections(id) on delete set null;
