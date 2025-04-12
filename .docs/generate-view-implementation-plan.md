# View implementation plan: Flashcard Generation View

## 1. Overview
This view provides an interface for users (both demo and authenticated) to generate AI-driven flashcard candidates from a block of plain text (100 to 10,000 characters). Users can input text, trigger AI generation, review the generated candidates (with options to accept, edit, or reject), and complete the process to save accepted flashcards. The view includes accessible form inputs, loading indicators, toast notifications, and supports secure operations for authenticated sessions.

## 2. Routing of the view
The Flashcard Generation View will be accessible at the root path: `/`.

## 3. Component structure
```
src/pages/index.astro
└── FlashcardGenerationView (React client component)
    ├── TextInputArea
    ├── GenerateButton
    ├── LoadingIndicator (conditional)
    ├── NotificationArea (toast notifications)
    └── CandidateReviewArea (conditional)
        ├── FlashcardCandidateCard[]
        │   ├── EditButton
        │   └── RejectButton
        └── CompleteReviewButton
            └── EditCandidateForm (modal/inline, conditional)
```

## 4. Component details
### FlashcardGenerationView
- **Description:** Main container that orchestrates the AI flashcard generation process, manages state, handles API interactions, and renders the entire UI.
- **Main elements:** Container `<div>`, integrates child components.
- **Supported interactions:** Handling text input updates, generate trigger, candidate editing/rejection, and review completion.
- **Validation:** Verifies input text length (100 to 10000 characters) and user authentication before completing review.
- **Types:** Uses DTOs (`GenerateFlashcardCommand`, `GenerateFlashcardResponseDTO`) and a custom view model (`CandidateWithLocalStatus`).
- **Props:** None (retrieves necessary context from global hooks or parent Astro page).

### TextInputArea
- **Description:** A controlled text area for users to paste the source text for flashcard generation.
- **Main elements:** `<label>`, `<textarea>`, character count display, error message area.
- **Supported interactions:** `onChange` event to update parent state.
- **Validation:** Enforces a character count between 100 and 10,000.
- **Types:** Uses a simple string value; error state as a string or null.
- **Props:** `value: string`, `onChange: (value: string) => void`, `minLength: number`, `maxLength: number`, `error: string | null`.

### GenerateButton
- **Description:** Button to trigger the AI generation API call.
- **Main elements:** `<button>` element with loading and disabled states.
- **Supported interactions:** `onClick` to trigger generation request.
- **Validation:** Disabled if the text input does not meet the required length or if a generation process is already in progress.
- **Types:** Boolean for `isDisabled`/`isLoading`; click handler function.
- **Props:** `onClick: () => void`, `isDisabled: boolean`, `isLoading: boolean`.

### CandidateReviewArea
- **Description:** Displays the list of generated flashcard candidate cards once generation is complete. Provides an option to complete the review process.
- **Main elements:** List or grid container; renders multiple `FlashcardCandidateCard` components; includes a `CompleteReviewButton`.
- **Supported interactions:** Propagates candidate-specific actions (reject, edit) to the parent; handles completion click.
- **Validation:** Only visible if candidates are available and a valid generation ID exists.
- **Types:** Uses an array of `CandidateWithLocalStatus`.
- **Props:** `candidates: CandidateWithLocalStatus[]`, `generationId: string | null`, `onRejectCandidate: (candidateId: string) => void`, `onEditCandidateStart: (candidateId: string) => void`, `onCompleteReview: () => void`, `isLoadingCompletion: boolean`.

### FlashcardCandidateCard
- **Description:** Displays an individual candidate with its front and back text. Offers actions to edit or reject the candidate.
- **Main elements:** Card container, text displays, Edit and Reject buttons.
- **Supported interactions:** Clicking the Edit button launches the `EditCandidateForm`; clicking Reject triggers a candidate rejection API call.
- **Validation:** May disable actions if the candidate is already in a non-pending state or if a related operation is in progress.
- **Types:** Based on `CandidateWithLocalStatus` view model.
- **Props:** `candidate: CandidateWithLocalStatus`, `onReject: (candidateId: string) => void`, `onEditStart: (candidateId: string) => void`.

### EditCandidateForm
- **Description:** Modal or inline form that allows users to edit a candidate's text.
- **Main elements:** Input fields (or textarea) for editing front and back text, Save and Cancel buttons.
- **Supported interactions:** `onChange` for inputs; Save triggers update API call; Cancel closes the form.
- **Validation:** Ensures fields are not empty; may include further basic validations.
- **Types:** Uses `UpdateFlashcardCandidateCommand` DTO.
- **Props:** `candidate: CandidateWithLocalStatus`, `onSave: (candidateId: string, updateData: UpdateFlashcardCandidateCommand) => Promise<void>`, `onCancel: () => void`, `isSaving: boolean`.

### LoadingIndicator
- **Description:** Visual spinner indicating that an API call or processing is in progress.
- **Main elements:** Spinner icon (e.g., Shadcn Loader).
- **Supported interactions:** None.
- **Types:** N/A.
- **Props:** `isLoading: boolean`.

### NotificationArea
- **Description:** Manages toast notifications to display info, success, or error messages to the user.
- **Main elements:** Toast container and individual toast messages.
- **Supported interactions:** Supports dismissal of messages.
- **Types:** Uses a `Notification` view model that includes ID, type, message, and optional duration.
- **Props:** Typically provided by a ToastProvider context.

## 5. Types

**DTOs from backend (src/types.ts):**
- `GenerateFlashcardCommand`: { source_text: string }
- `GenerateFlashcardResponseDTO`: { generation_id: string, candidates: FlashcardCandidateDTO[] }
- `FlashcardCandidateDTO`: { candidate_id: string, front_text: string, back_text: string, status: 'pending' | 'accepted' | 'edited' }
- `UpdateFlashcardCandidateCommand`: { front_text: string, back_text: string }
- `UpdateFlashcardCandidateResponseDTO`: { message: string, candidate: { candidate_id: string, front_text: string, back_text: string } }
- `CompleteGenerationResponseDTO`: { message: string, stats: { total_candidates: number, accepted: number, rejected: number }, saved_flashcards: FlashcardDTO[] }
- `FlashcardDTO`: { id: string, front_text: string, back_text: string, is_ai: boolean, created_at: string }

**Custom View Models:**
- `CandidateWithLocalStatus`:
  - candidate_id: string
  - front_text: string
  - back_text: string
  - original_front_text: string
  - original_back_text: string
  - local_status: 'pending' | 'edited-unsaved' | 'edited-saved' | 'rejected'
  - is_saving_edit: boolean
  - is_rejecting: boolean
- `Notification`:
  - id: string
  - type: 'success' | 'error' | 'info'
  - message: string
  - duration?: number

## 6. State management
State is managed in the `FlashcardGenerationView` component using a custom hook (e.g., `useFlashcardGeneration`). Key state variables include:
- `sourceText`: string – user input
- `generationId`: string | null – ID from the generation API
- `candidates`: CandidateWithLocalStatus[] – list of candidate flashcards
- `isLoadingGeneration`: boolean – loading state for generating candidates
- `isLoadingCompletion`: boolean – loading state for completing review
- `isEditingCandidateId`: string | null – tracks which candidate is being edited
- `error`: string | null – holds error messages
- `notifications`: Notification[] – for toast messages
- `isAuthenticated`: boolean – user auth status obtained via context or Supabase client

## 7. API Integration
APIs are integrated using fetch requests within the custom hook and component event handlers:
- **Generate Flashcards:**
  - Endpoint: POST /api/flashcards/generate
  - Request: { source_text: string }
  - Response: { generation_id: string, candidates: FlashcardCandidateDTO[] }
- **Update Candidate (Edit):**
  - Endpoint: PUT /api/flashcards/candidates/{candidate_id}
  - Request: { front_text: string, back_text: string, accept: boolean }
  - Response: { message: string, candidate: { candidate_id, front_text, back_text } }
- **Reject Candidate:**
  - Endpoint: PUT /api/flashcards/candidates/{candidate_id}/reject
  - Response: { message: string }
- **Complete Review:**
  - Endpoint: POST /api/flashcards/generations/{generation_id}/complete
  - Response: { message: string, stats: { total_candidates, accepted, rejected }, saved_flashcards: FlashcardDTO[] }

## 8. User interactions
- **Text Input:** User types/pastes text; character count and validation update in real time.
- **Generate:** Clicking the GenerateButton triggers the generation API call; shows a loading indicator; on success, candidate cards appear.
- **Reject:** Clicking a candidate's Reject button calls the API to mark it as rejected; the card updates visually and a toast confirms the action.
- **Edit:** Clicking Edit brings up an EditCandidateForm with pre-filled data; saving triggers an update API call, updating the card's text and status.
- **Complete Review:** Clicking the CompleteReviewButton sends a request to complete the review; on success, displays review stats and saves accepted flashcards.

## 9. Conditions and validation
- **Text Length:** Must be between 100 and 10,000 characters; otherwise, disable generation and display error message.
- **Loading States:** Disable buttons and show LoadingIndicator during API calls.
- **Candidate State:** Ensure candidates have not been rejected before allowing completion; disable actions when operations are in progress.
- **Authentication:** Verify user is authenticated before allowing flashcards to be saved; handle 401 responses.

## 10. Error handling
- **Validation Errors:** Display inline error messages for invalid text length.
- **API Errors:** Catch errors from API calls and display toast notifications. For 400 errors (e.g., no candidates accepted), inform the user; for 401 errors, prompt re-authentication; for 500 errors, display a generic error message.
- **Network Issues:** Display a toast notifying the user of connectivity issues.

## 11. Implementation steps
1. Create/update the Astro page at `src/pages/index.astro` to render the FlashcardGenerationView as a client component.
2. Develop the `FlashcardGenerationView` component to manage overall state and layout the sub-components.
3. Implement the `useFlashcardGeneration` hook to encapsulate state management and API calls.
4. Build the `TextInputArea` component with character count and validation messaging.
5. Create the `GenerateButton` component that triggers the text generation API call.
6. Implement API interaction for generating flashcards and map responses to the CandidateWithLocalStatus view model.
7. Develop the `CandidateReviewArea` to display candidate cards using the `FlashcardCandidateCard` component.
8. Add reject functionality in `FlashcardCandidateCard` calling the rejection API endpoint and updating state.
9. Implement the `EditCandidateForm` to allow editing candidate flashcards, including API integration for updates.
10. Add a `CompleteReviewButton` that triggers the completion API and, upon success, displays a toast with stats or navigates as needed.
11. Integrate a Toast/Notification system (e.g., from Shadcn/ui) to display error and success messages.
12. Ensure all components are accessible (proper ARIA labels, focus management, keyboard navigability) and styled with Tailwind.
13. Test each component in isolation and then the full flow, handling edge cases (e.g., API failures, invalid inputs, unauthenticated access).
14. Perform end-to-end testing to confirm the complete generation and review flows work as expected. 