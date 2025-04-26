REST API Plan

1. Resources

---

- Users (Database table: `users`)

  - Fields: id, email, hashed_password, created_at, etc.

- Flashcards (Database table: `flashcards`)

  - Fields: id, user_id, front_text, back_text, is_ai (boolean), created_at, updated_at, review_count, etc.

- Generations (Database table: `generations`)
  - Fields: id, flashcard_id, source_text, ai_response_details, status (pending, accepted, rejected), etc.
  - Relationship: One-to-One with flashcards (for AI-generated flashcards)

2. Endpoints

---

### Flashcards

- GET /api/flashcards

  - Description: List flashcards for the authenticated user
  - Query Parameters (optional):
    page (default=1), limit (default=20), filter (e.g., type: 'ai' or 'manual'), sort (e.g., 'created_at')
  - Response Payload:
    {
    "flashcards": [
    {
    "id": "uuid",
    "front_text": "Question",
    "back_text": "Answer",
    "is_ai": true,
    "created_at": "timestamp"
    }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 100 }
    }
  - Success: 200 OK
  - Errors: 401 Unauthorized

- GET /api/flashcards/{id}

  - Description: Retrieve details of a specific flashcard
  - Response Payload:
    {
    "id": "uuid",
    "front_text": "Question",
    "back_text": "Answer",
    "is_ai": false,
    "created_at": "timestamp"
    }
  - Success: 200 OK
  - Errors: 404 Not Found, 401 Unauthorized

- POST /api/flashcards

  - Description: Create a new flashcard (manual creation)
  - Request Payload:
    {
    "front_text": "Question",
    "back_text": "Answer"
    }
  - Response Payload:
    {
    "message": "Flashcard created successfully",
    "flashcard": {
    "id": "uuid",
    "front_text": "Question",
    "back_text": "Answer",
    "is_ai": false,
    "created_at": "timestamp"
    }
    }
  - Success: 201 Created
  - Errors: 400 for validation errors, 401 Unauthorized

- PUT /api/flashcards/{id}

  - Description: Update an existing flashcard
  - Request Payload:
    {
    "front_text": "Updated question",
    "back_text": "Updated answer"
    }
  - Response Payload:
    {
    "message": "Flashcard updated successfully",
    "flashcard": {
    "id": "uuid",
    "front_text": "Updated question",
    "back_text": "Updated answer",
    "is_ai": false,
    "updated_at": "timestamp"
    }
    }
  - Success: 200 OK
  - Errors: 400 for validation issues, 404 Not Found, 401 Unauthorized

- DELETE /api/flashcards/{id}
  - Description: Delete a flashcard
  - Response Payload:
    { "message": "Flashcard deleted successfully" }
  - Success: 200 OK
  - Errors: 404 Not Found, 401 Unauthorized

### AI-Driven Flashcard Generation

- POST /api/flashcards/generate

  - Description: Generate flashcard candidates from plain text via an AI service
  - Request Payload:
    {
    "source_text": "Input text (100 to 10000 characters)"
    }
  - Response Payload:
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
  - Success: 200 OK
  - Errors: 400 for invalid text length, 500 if AI service fails, 401 Unauthorized

- PUT /api/flashcards/candidates/{candidate_id}

  - Description: Update a candidate flashcard during review (edit or change status)
  - Request Payload:
    {
    "front_text": "Edited question",
    "back_text": "Edited answer",
    "accept": true | false // Boolean indicating if user accepts the candidate or rejects
    }
  - Response Payload:
    {
    "message": "Candidate updated successfully",
    "candidate": {
    "candidate_id": "uuid",
    "front_text": "Edited question",
    "back_text": "Edited answer"
    }
    }
  - Success: 200 OK
  - Errors: 400 for validation issues, 404 Not Found, 401 Unauthorized

- PUT /api/flashcards/candidates/{candidate_id}/reject

  - Description: Reject a candidate flashcard during review
  - Response Payload:
    {
    "message": "Candidate rejected"
    }
  - Success: 200 OK
  - Errors: 400 for validation issues, 404 Not Found, 401 Unauthorized

- PUT /api/flashcards/generations/{generation_id}/complete
  - Description: Complete the review of AI-generated candidates and save accepted ones
  - Request Payload: {}
  - Response Payload:
    {
    "message": "Generation review completed",
    "stats": {
    "total_candidates": 10,
    "accepted": 7,
    "rejected": 3
    },
    "saved_flashcards": [
    {
    "id": "uuid",
    "front_text": "Question",
    "back_text": "Answer",
    "is_ai": true,
    "created_at": "timestamp"
    }
    ]
    }
  - Success: 200 OK
  - Errors: 400 if no candidates accepted, 401 Unauthorized

3. Authentication and Authorization

---

- The API uses JWT token-based authentication. Tokens must be included in the Authorization header as "Bearer <token>" for protected endpoints.
- Endpoints for user registration, login, and password recovery are public; all others require a valid token.
- Authorization ensures users can only access and modify their own records.

4. Validation and Business Logic

---

- Validation Conditions:

  - Users: Valid email format; password meets complexity requirements.
  - Flashcards: "front_text" and "back_text" must be non-empty; AI generation inputs must be between 100 and 10000 characters.
  - Each flashcard must be associated with a valid user (using the JWT token to scope requests).
  - For AI-generated flashcards, maintain the one-to-one relationship with a generation record.
  - Learning session reviews must provide a valid boolean for the "known" field.

- Business Logic:
  - User Operations: Secure password hashing, email verification, and password recovery workflow.
  - AI Flashcard Generation:
    - Integrate with an external AI service
    - Support a review workflow where users can edit and accept/reject each candidate
    - Track generation statistics and user acceptance rates
    - Only save accepted candidates as actual flashcards
  - Flashcard Management:
    - Standard CRUD operations with authorization checks
    - List endpoints support pagination, filtering, and sorting
    - Track review history and performance metrics for each card
  - Learning Sessions:
    - Spaced repetition algorithm considers "known/unknown" responses
    - Session progress tracking with detailed statistics
    - Adaptive difficulty based on user performance
    - Support for session interruption and resumption
