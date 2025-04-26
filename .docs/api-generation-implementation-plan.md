# API Endpoint Implementation Plan: AI-Driven Flashcard Generation Endpoints

## 1. Overview of the endpoint

This suite of endpoints enables AI-driven flashcard generation. It covers creating flashcard candidates from input text, reviewing and updating candidates, and completing the generation process by saving accepted candidates as flashcards.

## 2. Endpoint Details

### 2.1. POST /api/flashcards/generate

#### Request

- **HTTP Method**: POST
- **URL**: /api/flashcards/generate
- **Parameters**:
  - **Required**:
    - `source_text` (string): Input text with length between 100 to 10000 characters.
- **Request Body Example**:
  ```json
  { "source_text": "Input text (100 to 10000 characters)" }
  ```

#### Response

- **Success**: 200 OK
- **Response Payload Example**:
  ```json
  {
    "generation_id": "uuid",
    "candidates": [
      {
        "candidate_id": "uuid",
        "front_text": "Generated question",
        "back_text": "Generated answer",
        "status": "pending"
      }
    ]
  }
  ```
- **Error Responses**:
  - 400 Bad Request for invalid `source_text` length.
  - 401 Unauthorized for missing or invalid token.
  - 500 Internal Server Error if the AI service fails.

### 2.2. PUT /api/flashcards/candidates/{candidate_id}

#### Request

- **HTTP Method**: PUT
- **URL**: /api/flashcards/candidates/{candidate_id}
- **Parameters**:
  - **Path Parameter**:
    - `candidate_id` (UUID): Identifier for the flashcard candidate.
  - **Request Body Required**:
    - `front_text` (string): Edited question text.
    - `back_text` (string): Edited answer text.
    - `accept` (boolean): Indicator if the candidate is accepted (true) or rejected (false).
- **Request Body Example**:
  ```json
  {
    "front_text": "Edited question",
    "back_text": "Edited answer",
    "accept": true
  }
  ```

#### Response

- **Success**: 200 OK
- **Response Payload Example**:
  ```json
  {
    "message": "Candidate updated successfully",
    "candidate": { "candidate_id": "uuid", "front_text": "Edited question", "back_text": "Edited answer" }
  }
  ```
- **Error Responses**:
  - 400 Bad Request for validation failures.
  - 404 Not Found if the candidate does not exist.
  - 401 Unauthorized for authentication failures.

### 2.3. POST /api/flashcards/generations/{generation_id}/complete

#### Request

- **HTTP Method**: POST
- **URL**: /api/flashcards/generations/{generation_id}/complete
- **Parameters**:
  - **Path Parameter**:
    - `generation_id` (UUID): Identifier for the flashcard generation batch.
- **Request Body**: Empty JSON object `{}`

#### Response

- **Success**: 200 OK
- **Response Payload Example**:
  ```json
  {
    "message": "Generation review completed",
    "stats": { "total_candidates": 10, "accepted": 7, "rejected": 3 },
    "saved_flashcards": [
      { "id": "uuid", "front_text": "Question", "back_text": "Answer", "is_ai": true, "created_at": "timestamp" }
    ]
  }
  ```
- **Error Responses**:
  - 400 Bad Request if no candidate is accepted.
  - 401 Unauthorized for authentication issues.

## 3. Types used

- **GenerateFlashcardCommand**: Contains the `source_text` for flashcard generation.
- **GenerateFlashcardResponseDTO**: Returns `generation_id` and an array of `FlashcardCandidateDTO` objects.
- **FlashcardCandidateDTO**: Represents a candidate flashcard with `candidate_id`, `front_text`, `back_text`, and `status` (pending).
- **UpdateFlashcardCandidateCommand**: Includes `front_text`, `back_text`, and `accept` for candidate updates.
- **UpdateFlashcardCandidateResponseDTO**: Provides a confirmation message and updated candidate details.
- **CompleteGenerationResponseDTO**: Contains a confirmation message, review statistics, and an array of saved flashcards.

## 4. Data flow

1. The request is received at the endpoint and JWT authentication is performed, attaching the user context via middleware.
2. Input validation is executed using Zod schemas:
   - For `/generate`: Validate that `source_text` length is within the allowed range.
   - For `/candidates`: Validate that `front_text` and `back_text` are non-empty and `accept` is a boolean.
3. The service layer (located in `src/lib/services/flashcards.service.ts`) handles business logic:
   - **/generate**: Calls an external AI service to generate candidates and creates a generation record in the database.
   - **/candidates**: Updates candidate records based on review edits and acceptance.
   - **/complete**: Validates accepted candidates and persists them into the `flashcards` table.
4. All database operations enforce user isolation through Supabase's row-level security.
5. Upon successful operations, appropriate response payloads are sent to the client.

## 5. Security considerations

- **Authentication & Authorization**: Use JWT token-based authentication; enforce Supabase row-level security policies based on `app.current_user_id`.
- **Input Validation & Sanitization**: Use Zod for input validation. Sanitize inputs to prevent injection attacks.
- **External Service Security**: Ensure secure integration with the external AI service using API keys and proper error handling.
- **Rate Limiting & Monitoring**: Consider rate limiting to mitigate abuse and logging for monitoring potential attacks.

## 6. Error handling

- **400 Bad Request**: For invalid input (e.g., text length violations, empty fields, no accepted candidates).
- **401 Unauthorized**: When JWT token is missing or invalid.
- **404 Not Found**: If the candidate or generation record is not found for updates or completions.
- **500 Internal Server Error**: For unexpected failures, including external service errors.
- **Logging**: Errors, especially those from the AI service, should be logged into the `generation_error_logs` table with relevant details such as `user_id`, model, `generation_id`, error message, and error code.

## 7. Performance considerations

- **Service Layer Optimization**: Abstract business logic into a dedicated service to facilitate scalability and maintainability.
- **Asynchronous External Service Calls**: Use asynchronous processing for AI service calls to avoid blocking the main thread.
- **Efficient Database Operations**: Utilize available indexes (e.g., on `user_id`) for quick lookups, and consider batch operations when processing multiple candidates.
- **Caching Strategies**: Cache intermediary results where applicable to reduce repeated AI service calls.

## 8. Implementation steps

1. **Service Layer**: Create/update `src/lib/services/flashcards.service.ts` with functions to:
   - Process generation requests by validating input and calling the external AI service. At this point we will use mock instead of the real AI service.
   - Record generation details and candidate information in the database.
   - Handle candidate updates and manage status changes.
   - Finalize generation by saving accepted candidates to the `flashcards` table.
2. **Middleware**: Implement JWT validation middleware that:
   - Extracts and verifies the token.
   - Sets the current user context (used by Supabase RLS policies).
3. **Validation**: Define Zod schemas for:
   - `source_text` length in the generate endpoint.
   - Candidate update fields (`front_text`, `back_text`, and `accept`).
4. **Endpoint Handlers**:
   - Implement controllers for each endpoint (/generate, /candidates/{candidate_id}, /generations/{generation_id}/complete) that call corresponding service functions.
5. **Error Handling & Logging**:
   - Incorporate try-catch blocks and detailed error responses.
   - Log errors to the `generation_error_logs` table when AI service calls or database operations fail.
