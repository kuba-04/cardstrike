-- Migration: Initial Schema Setup
-- Description: Creates the initial database schema including users, flashcards, generations, and error logs tables
-- with appropriate relationships, indexes, and row level security policies.

-- Create custom types
create type flashcard_origin as enum ('MAN', 'AI_FULL', 'AI_EDIT');

-- Create users table
create table users (
    id uuid primary key default auth.uid(),
    username varchar(100) not null,
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    email_verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create generations table first
create table generations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    model varchar not null,
    source_text text not null,
    status varchar(20) not null default 'pending',
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (status in ('pending', 'completed', 'failed'))
);

-- Create flashcards table
create table flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    generation_id uuid,
    front_content varchar(200) not null,
    back_content varchar(200) not null,
    created_by flashcard_origin not null,
    next_review_at timestamptz,
    last_review_at timestamptz,
    interval integer,
    repetition_count integer,
    ease_factor numeric(4,2),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    foreign key (generation_id) references generations(id) on delete set null
);

-- Create generation_error_logs table
create table generation_error_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    model varchar not null,
    generation_id uuid references generations(id) on delete set null,
    error_message text not null,
    error_code varchar(50),
    created_at timestamptz not null default now()
);

-- Description: Creates table for storing generated flashcard candidates before acceptance

create table public.flashcard_candidates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    generation_id uuid not null references generations(id) on delete cascade,
    front_content varchar(200) not null,
    back_content varchar(200) not null,
    status varchar(20) not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'edited')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create updated_at trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create updated_at triggers
create trigger set_updated_at
    before update on users
    for each row
    execute function handle_updated_at();

create trigger set_updated_at
    before update on flashcards
    for each row
    execute function handle_updated_at();

create trigger set_updated_at
    before update on generations
    for each row
    execute function handle_updated_at();

-- Enable Row Level Security
alter table flashcards enable row level security;
alter table generations enable row level security;
alter table generation_error_logs enable row level security;

-- Create RLS Policies for flashcards
create policy "Users can view their own flashcards"
    on flashcards for select
    using (auth.uid() = user_id);

create policy "Users can insert their own flashcards"
    on flashcards for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on flashcards for update
    using (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on flashcards for delete
    using (auth.uid() = user_id);

-- Create RLS Policies for generations
create policy "Users can view their own generations"
    on generations for select
    using (auth.uid() = user_id);

create policy "Users can insert their own generations"
    on generations for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own generations"
    on generations for update
    using (auth.uid() = user_id);

create policy "Users can delete their own generations"
    on generations for delete
    using (auth.uid() = user_id);

-- Create RLS Policies for generation_error_logs
create policy "Users can view their own error logs"
    on generation_error_logs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs"
    on generation_error_logs for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own error logs"
    on generation_error_logs for delete
    using (auth.uid() = user_id);

-- Create indexes
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_generation_id on flashcards(generation_id);
create index idx_generations_user_id on generations(user_id);
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

create index idx_flashcard_candidates_user_id on flashcard_candidates(user_id);
create index idx_flashcard_candidates_generation_id on flashcard_candidates(generation_id); 