# UI architecture for CardStrike Flashcards.

## 1. Overview of the UI structure
The UI is organized as a unified application that conditionally renders navigation elements based on the user's authentication state. It integrates AI-driven flashcard generation, manual flashcard creation, flashcard management, and a learning session for spaced repetition. Built using Astro, React, and Tailwind CSS, the design emphasizes user experience, accessibility, and security while aligning with our API capabilities.

## 2. List of views

- **Flashcard Generation View**
  - **Path:** `/`
  - **Main target:** Provide an interface for users (both demo and authenticated) to generate flashcards using AI.
  - **Key information:** Input area for plain text (100 to 10000 characters), notifications (especially for demo mode), display of generated candidate flashcards, and controls for accepting or rejecting candidates.
  - **Key components:** Text input, generate button, candidate cards (with tile and detailed modes), accept button, reject all option, loading indicators, and toast notifications.
  - **UX, accessibility and security considerations:** Accessible labels for inputs, focus management, ARIA attributes, clear error messages, and route protection for authenticated sessions.

- **Flashcard Review & Editing View**
  - **Path:** `/review`
  - **Main target:** Enable users to review AI-generated flashcard candidates in either a zoomed-out tile view or a detailed view for editing.
  - **Key information:** Candidate flashcards highlighted with status indicators, editable fields for question and answer, and comparison of candidate text with final accepted versions.
  - **Key components:** Candidate card components (tile and modal/detailed), edit forms, dynamic action buttons (accept, reject, delete), and responsive layouts based on screen size.
  - **UX, accessibility and security considerations:** Keyboard navigability, clearly labeled actions, and feedback on interactions. Authentication checks ensure that only permitted users can edit.

- **Manual Flashcard Creation View**
  - **Path:** `/manual`
  - **Main target:** Allow users to manually create flashcards with direct input for questions and answers.
  - **Key information:** Interactive form with input validation and real-time feedback.
  - **Key components:** Form fields for question and answer, validation messages, and a submission button.
  - **UX, accessibility and security considerations:** Clear input labeling, error handling via toasts, and secure connection to the API for data persistence.

- **Flashcard Management View**
  - **Path:** `/flashcards`
  - **Main target:** Present a dashboard where users can view, edit, and delete their saved flashcards.
  - **Key information:** A list or grid of flashcards with concise details, action buttons for edit and delete, and filtering/sorting options.
  - **Key components:** List or card view for flashcards, pagination and filtering controls, and modals for confirmation dialogs.
  - **UX, accessibility and security considerations:** Responsive design for different devices, screen reader compatibility, and secure API operations for update and deletion.

- **Learning Session View**
  - **Path:** `/learn`
  - **Main target:** Facilitate a spaced repetition learning session where users interact with one flashcard at a time.
  - **Key information:** Presentation of flashcards one by one with flip animations, evaluation options, and session progress indicators.
  - **Key components:** Flashcard display with flip animation, interactive evaluation buttons (to rate knowledge), and a progress tracker.
  - **UX, accessibility and security considerations:** Large, accessible interactive elements, keyboard and screen reader support, and immediate persistence of user feedback.

- **Authentication Views (Registration, Login, Password Recovery)**
  - **Paths:**
    - Registration: `/register`
    - Login: `/login`
    - Password Recovery: `/recover`
  - **Main target:** Handle user account creation, authentication, and password reset.
  - **Key information:** Forms capturing required credentials with real-time validation and user feedback.
  - **Key components:** Input forms, submission buttons, error/success toasts, and secure integration with the JWT-based authentication API.
  - **UX, accessibility and security considerations:** Clear instructions, password complexity indicators, secure token handling, and accessible error messages.

## 3. User journey map

1. **Landing / Flashcard Generation:** 
   - The user lands on `/` and is presented with the flashcard generation interface. Demo mode users are alerted via a toast about unsaved changes, while authenticated users see full review capabilities.
2. **Flashcard Generation Submission:** 
   - The user inputs plain text and initiates flashcard generation. The generated candidates are displayed, in tiles and user navigate to `/review` page to engage with them.
3. **Review & Editing:**
   - The user navigates to `/review` either through direct interaction or as part of a guided process to review and edit AI-generated candidates in a detailed view.
4. **Manual Creation / Management:**
   - The user may go to `/manual` for creating flashcards manually and to `/flashcards` to manage (edit/delete) existing flashcards.
5. **Learning Session:**
   - After managing their flashcards, the user can start a learning session from `/learn`, interacting with each flashcard and providing recall feedback.
6. **Authentication Flow:**
   - Unauthenticated users are routed to `/login` or `/register`, and password recovery is available at `/recover`. Upon successful authentication, protected routes become accessible.
7. **Error Handling:**
   - Throughout the journey, any API errors, validation issues, or unauthorized access triggers toast notifications with clear instructions, ensuring users are informed and able to take corrective action.

## 4. Navigation layout and structure

- **Main Navigation Bar:**
  - Displays primary links to the flashcard generation view (central focus), with dynamic elements based on authentication status.
  - For authenticated users, includes links to Flashcard Management, Learning Session, and Account settings.
  
- **Conditional Side Navigation:**
  - Offered on authenticated routes to facilitate quick navigation between `/flashcards`, `/manual`, and `/learn`.
  
- **Footer Navigation:**
  - Contains links to support, legal information, and privacy policies, accessible and clearly labeled on all views.
  
- **Route Guards:**
  - Client-side guards ensure secure access and redirect unauthenticated users to `/login` when attempting to access protected routes.

## 5. Key components

- **Input and Validation Components:**
   - Used across flashcard generation, manual creation, and authentication forms. Incorporates ARIA-compliant error messaging.
- **Flashcard Card Component:**
   - A reusable component for displaying flashcards with flip animations, adaptable for both candidate review and flashcard management.
- **Modal Dialogs:**
   - Employed for detailed flashcard editing, confirmation of delete actions, and additional information overlays.
- **Toast/Notification System:**
   - Provides consistent, real-time feedback for errors, successes, and informational messages across the application.
- **Loading Indicators:**
   - Centrally displayed during asynchronous data fetching or view transitions to inform users of ongoing operations.
- **Pagination and Filtering Controls:**
   - Reusable components enabling efficient navigation within lists of flashcards, with search and sort functionalities.
- **Security Components:**
   - Handle tasks such as token management, error interceptors, and secure API communications to protect user data. 