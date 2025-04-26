<conversation_summary>.
<decisions>.

1. A separate table named "generations" will be used for storing AI flashcard proposals; it includes a foreign key to the user (user_id) and is independent until a flashcard is accepted. Once accepted, a new record in the flashcards table is created and the corresponding generation record is deleted.
2. The flashcards table will contain spaced repetition fields (such as next_review_at) that update based on review logic: if a card is known, next_review_at is set one week ahead; if not known, it is set to the next day.
3. The flashcards table will include a "created_by" column defined as an ENUM with allowed values: MAN, AI_FULL, and AI_EDIT (indicating manual creation, full AI generation, or AI-generated but edited by the user).
4. The users table will include typical fields (username, email) along with password hash, email verification status, created_at, and updated_at.
5. Searches will primarily use the user_id field; no advanced sorting or indexing by review dates is required at this stage.
6. The relationship between users and flashcards is a simple one-to-many.
7. Spaced repetition data will be stored directly in the flashcards table.
8. Flashcard content (both front and back) must be defined as NOT NULL with a maximum character limit of 200.
9. A separate table will capture AI generation statistics, updated every time a new flashcard is created; this table will include a user_id column and a timestamp to calculate the percentage of AI-generated cards relative to total cards.
10. A "generation_error_logs" table will be created to record error_message, error_code, timestamp, the related flashcard or generation id, and user_id.
11. CASCADE behavior will be applied to foreign key constraints (e.g., deleting a user cascades to the flashcards), and the updated_at field should be automatically updated via a Supabase trigger in all relevant tables.
    </decisions>.

<matched_recommendations>.

1. The creation of a `users` table with username, email, password hash, email verification status, and timestamps aligns with the decision regarding typical user fields.
2. Designing a `flashcards` table with columns for id, front_content, back_content (each NOT NULL and limited to 200 characters), a `created_by` ENUM column, and spaced repetition attributes matches the discussed requirements.
3. Implementing spaced repetition attributes directly in the flashcards table, with logic to update `next_review_at` based on user review responses, is confirmed.
4. Establishing a separate `generations` table for AI flashcard proposals, tied to user_id and designed to be deleted upon flashcard acceptance, is consistent with the conversation.
5. Creating a dedicated table for AI generation statistics, including a user_id column and timestamp, corresponds with the discussion.
6. Building a `generation_error_logs` table with fields including error_message, error_code, timestamp, related flashcard/generation id, and user_id is directly matched.
7. Applying CASCADE behavior on foreign key constraints and updating the `updated_at` field via a Supabase trigger across tables is a confirmed recommendation.
   </matched_recommendations>.

<database_planning_summary>
The main requirements for the database schema are to support two types of flashcard creation (manual and AI-generated), track spaced repetition details, and enforce user-level security via row-level security (RLS). The key entities are:

- Users: storing basic information (username, email, etc.) and security-related data.
- Flashcards: containing content (front and back with a character limit), spaced repetition attributes (next_review_at, etc.), and a `created_by` ENUM column to dictate the origin.
- Generations: a temporary table for AI-generated flashcard proposals that hold a user_id until acceptance.
- Generation Statistics: a separate table to capture metrics about AI generation rates.
- Generation Error Logs: a dedicated table for recording any errors during the AI flashcard generation process.
  Relationships are straightforward, with a simple one-to-many association between users and flashcards (as well as generations and error logs). Security is addressed by enforcing RLS policies that restrict data access to the owning user, and automatic trigger mechanisms in Supabase will maintain data integrity (updating timestamps on modifications). Scalability is approached conservatively at this stage by indexing on user_id and not over-complicating partitioning or advanced sorting. The design also incorporates appropriate constraints, such as NOT NULL and maximum lengths for text fields, and uses ENUMs to restrict allowed values.
  </database_planning_summary>.
  </conversation_summary>
