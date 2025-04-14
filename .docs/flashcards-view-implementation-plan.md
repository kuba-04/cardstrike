/*
View implementation plan: Manual Flashcard Creation & Flashcard Management

## 1. Overview
Manual Flashcard Creation View provides an interactive form for users to manually input flashcard question and answer text with real‑time validation and immediate feedback. Flashcard Management View presents a dashboard where users can view, edit, and delete their saved flashcards, complete with filtering, sorting, and pagination controls.

## 2. Routing of the view
- Manual Flashcard Creation View: Accessible at `/manual`
- Flashcard Management View: Accessible at `/flashcards`

## 3. Component structure
```
/ManualFlashcardCreationView
  ├─ ManualFlashcardForm
      ├─ InputField (for question)
      ├─ InputField (for answer)
      ├─ ValidationMessage
      ├─ SubmitButton
      ├─ ToastNotifications

/FlashcardManagementView
  ├─ FlashcardList
      ├─ FlashcardCard
          ├─ EditButton
          ├─ DeleteButton
      ├─ PaginationControls
      ├─ FilterAndSortControls
  ├─ EditFlashcardModal
  ├─ DeleteConfirmationModal
  ├─ ToastNotifications
```

## 4. Component details
### ManualFlashcardForm
- **Description:** A form component for inputting flashcard question (front_text) and answer (back_text).
- **Main elements:** Two text input fields, inline validation messages, a submit button, and toast notifications for feedback.
- **Supported events:** 
  - onChange for both inputs
  - onSubmit to trigger flashcard creation
- **Validation conditions:** Both inputs are required; each must have 1–1000 characters.
- **Types:** Uses `CreateFlashcardCommand` for the API request and `CreateFlashcardResponseDTO` for the response.
- **Props:** May accept a callback to update parent state on successful creation.

### FlashcardList
- **Description:** Displays a list/grid of flashcards with options to edit or delete each one.
- **Main elements:** A list of `FlashcardCard` components along with pagination and filtering controls.
- **Supported events:** 
  - Click events for edit and delete actions
  - Pagination and filtering interactions
- **Validation conditions:** Flashcard data must adhere to the `FlashcardDTO` type.
- **Types:** Uses `FlashcardDTO`.
- **Props:** Receives an array of flashcards and callbacks for update and deletion operations.

### FlashcardCard
- **Description:** An individual card displaying the flashcard's details (question, answer, and AI indicator if applicable).
- **Main elements:** Display of `front_text`, a summary of `back_text`, and buttons for editing and deleting.
- **Supported events:** 
  - Edit button click to open the edit modal
  - Delete button click to prompt confirmation
- **Validation conditions:** Data must match the `FlashcardDTO` structure.
- **Types:** Uses `FlashcardDTO`.
- **Props:** Accepts flashcard data and action callbacks for editing and deletion.

### EditFlashcardModal
- **Description:** A modal that allows the user to edit a selected flashcard.
- **Main elements:** Input fields pre-populated with the flashcard data, validation messages, and save/cancel buttons.
- **Supported events:** 
  - Input changes, save submission, and cancel actions
- **Validation conditions:** Input values must be between 1–1000 characters.
- **Types:** Utilizes `UpdateFlashcardCommand` for updates.
- **Props:** Receives the flashcard's details and callbacks for saving or cancelling changes.

### DeleteConfirmationModal
- **Description:** A confirmation modal to verify deletion of a flashcard.
- **Main elements:** A confirmation message and buttons to confirm or cancel deletion.
- **Supported events:** 
  - Confirmation triggers the deletion API call
  - Cancellation closes the modal
- **Validation conditions:** Ensures a valid flashcard ID is provided.
- **Types:** Expects a response corresponding to `DeleteFlashcardResponseDTO` upon deletion.
- **Props:** Receives the flashcard ID and callbacks for deletion handling.

## 5. Types
- **CreateFlashcardCommand:** { front_text: string, back_text: string }
- **CreateFlashcardResponseDTO:** { message: string, flashcard: FlashcardDTO }
- **FlashcardDTO:** { id: string, front_text: string, back_text: string, is_ai: boolean, created_at: string }
- **UpdateFlashcardCommand:** { front_text: string, back_text: string }
- **UpdateFlashcardResponseDTO:** { message: string, flashcard: FlashcardDTO }
- **DeleteFlashcardResponseDTO:** { message: string }
- **ManualFlashcardFormState (ViewModel):** { front: string, back: string, errors: { front?: string; back?: string } }
- **FlashcardsListState (ViewModel):** { flashcards: FlashcardDTO[], currentPage: number, limit: number, total: number, filter?: string, sort?: string }

## 6. State management
- **ManualFlashcardCreationView:**
  - Manage form inputs and error states using `useState`.
  - Maintain a loading state and trigger toast notifications upon API response.
- **FlashcardManagementView:**
  - Use `useState` for the flashcard list, pagination, filtering, and sorting states.
  - Maintain state for modals (edit and delete confirmation).
  - Consider using a custom hook (e.g., `useFlashcards`) to encapsulate API interactions and state management.

## 7. API Integration
- **Manual Flashcard Creation:**
  - **Endpoint:** POST `/api/flashcards`
  - **Request type:** `CreateFlashcardCommand`
  - **Response type:** `CreateFlashcardResponseDTO`
  - Trigger API call on form submission and update state upon success or failure.
- **Flashcard Management:**
  - **Endpoint:** GET `/api/flashcards` for fetching the flashcards list (with pagination, filtering, and sorting via query parameters).
  - Additional endpoints for updating (e.g., PUT `/api/flashcards/[id]`) and deletion (e.g., DELETE `/api/flashcards/[id]`) integrated similarly.
  - Update local state immediately after successful API responses.

## 8. User interactions
- **Manual Flashcard Creation:**
  - Users enter question and answer text; real-time validation displays any errors.
  - On clicking submit, the form validates inputs and sends a POST request.
  - A successful response results in appending the new flashcard to the list and displaying a success toast; errors trigger an error toast.
- **Flashcard Management:**
  - Users see a list/grid of flashcards. Clicking edit opens the `EditFlashcardModal` with the selected flashcard data.
  - Clicking delete opens the `DeleteConfirmationModal`, and on confirmation, the flashcard is removed via an API call.
  - Pagination and filtering actions update the list view accordingly.

## 9. Conditions and validation
- **Manual Entry:**
  - Validate that `front_text` and `back_text` are non-empty and between 1–1000 characters.
- **API Conditions:**
  - Ensure submitted data complies with the expected schema; handle 400 responses by mapping errors to form fields.
- **Editing/Deletion:**
  - Validate that a valid flashcard `id` is provided before making update or delete requests.

## 10. Error handling
- **Frontend:**
  - Display inline error messages for invalid inputs.
  - Use toast notifications to inform users of API errors or network issues.
  - Log errors to the console for debugging purposes.
- **API errors:**
  - Map HTTP 400 errors to specific input fields, and show generic messages for other failures.

## 11. Implementation steps
1. Create new pages `/manual` and `/flashcards` under `src/pages`.
2. Develop the `ManualFlashcardForm` component with controlled inputs, real-time validation, and integration with the POST `/api/flashcards` endpoint.
3. Build the `FlashcardManagementView` page and implement the `FlashcardList` component.
4. Create the `FlashcardCard`, `EditFlashcardModal`, and `DeleteConfirmationModal` components with their respective event handlers.
5. Implement a custom hook (e.g., `useFlashcards`) for managing flashcard data (fetching, updating, deletion) and state logic.
6. Integrate API calls for creating, fetching, updating, and deleting flashcards; update UI state based on responses.
7. Add pagination, filtering, and sorting controls to the management view.
8. Apply Tailwind CSS and Shadcn/ui components for styling and ensuring responsive, accessible design.
9. Incorporate comprehensive error handling and user feedback via inline messages and toast notifications.
10. Test all components for validation, state updates, and API integration to ensure a smooth user experience.
*/ 