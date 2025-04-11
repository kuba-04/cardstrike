1. Tables

**users**
- id: UUID PRIMARY KEY
- username: VARCHAR(100) NOT NULL
- email: VARCHAR(255) NOT NULL UNIQUE
- password_hash: VARCHAR(255) NOT NULL
- email_verified: BOOLEAN NOT NULL DEFAULT false
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

**flashcards**
- id: UUID PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- generation_id: UUID REFERENCES generations(id) ON DELETE SET NULL
- front_content: VARCHAR(200) NOT NULL
- back_content: VARCHAR(200) NOT NULL
- created_by: flashcard_origin NOT NULL
- next_review_at: TIMESTAMPTZ
- last_review_at: TIMESTAMPTZ
- interval: INTEGER
- repetition_count: INTEGER
- ease_factor: NUMERIC(4,2)
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

*Trigger: Automatically update the `updated_at` column on record updates.*

**generations**
- id: UUID PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- model: VARCHAR NOT NULL
- generated_count: INTEGER NOT NULL
- accepted_unedited_count: INTEGER NULLABLE
- accepted_edited_count: INTEGER NULLABLE
- generation_duration: INTEGER NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

**generation_error_logs**
- id: UUID PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- model: VARCHAR NOT NULL
- generation_id: UUID REFERENCES generations(id) ON DELETE SET NULL
- error_message: TEXT NOT NULL
- error_code: VARCHAR(50)
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

2. Relationships

- One-to-Many: users to flashcards (flashcards.user_id → users.id)
- One-to-Many: users to generations (generations.user_id → users.id)
- One-to-Many: users to generation_error_logs (generation_error_logs.user_id → users.id)
- One-to-One: flashcards to generations
- generation_error_logs can reference a generation record.

3. Indexes

- Index on flashcards.user_id
- Index on generations.user_id
- Index on generation_error_logs.user_id
- Unique index on users.email (implied by UNIQUE constraint)

4. PostgreSQL Row-Level Security (RLS) Rules

- Enable RLS on tables: flashcards, generations, generation_error_logs.
- Example policy for each table:
  ```sql
  ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
  CREATE POLICY user_isolation_policy ON <table_name>
    USING (user_id = current_setting('app.current_user_id')::INTEGER);
  ```
  (Replace <table_name> with the actual table name.)

- Note: The app is expected to set the 'app.current_user_id' for each session.

5. Additional Comments

- A custom ENUM type is defined for flashcards:
  ```sql
  CREATE TYPE flashcard_origin AS ENUM ('MAN', 'AI_FULL', 'AI_EDIT');
  ```
  This type is used for the flashcards.created_by column.
- The spaced repetition logic (updating next_review_at) is managed by application logic or additional triggers.
- CASCADE behavior ensures that related records are deleted when a user is removed.
- The updated_at fields are expected to be maintained automatically via Supabase triggers. 