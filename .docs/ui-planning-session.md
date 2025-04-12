<conversation_summary>.
<decisions>.

1. The UI will use a unified view hierarchy that conditionally renders secondary navigation options based on the authentication state, keeping the flashcard generation tool as the main focus in both demo and authenticated modes.
2. A simple popup or toast (using Shadcn/ui components) will notify users in demo mode that their flashcards will not be saved.
3. Post-login routing will query the database for an existing study session. If a study session is found, the user is redirected there; otherwise, the landing page defaults to the flashcard generation tool.
4. The candidate flashcard view will have two modes: a zoomed-out tile view (for quick navigation and rejection/deletion) and a detailed, zoomed-in view (for editing and flipping cards via click/drag interactions).
5. Flashcard tiles will include built-in flip animations triggered by clicks. On mobile devices, the reject button will be overlaid at the bottom left and the edit button at the bottom center; on larger screens, the reject button sits inline at the bottom left and the edit button at the bottom right.
6. The accept button (for confirming generated flashcards) and a "reject all" control with generation statistics will be placed just below the navbar on large screens, while on mobile the accept button will be a fixed bottom-right overlay.
7. Global state management will be handled with React hooks and context (with the possibility of integrating Zustand later) to maintain clear separation between demo and authenticated modes.
8. A standard JWT authentication flow will be integrated with client-side route guards and accompanied by consistent error notifications (toasts) for issues like token expiration or invalid tokens.
9. A centralized, global mechanism will be established to handle API loading states and errors, displaying loading spinners and error toasts uniformly across all views.
10. Tailwind CSS best practices will be applied to ensure proper responsiveness and performance, with particular attention to scrollable areas, carousel behavior for mobile views, and overlay button placements.
</decisions>.

<matched_recommendations>.
1. Implement a unified view hierarchy with conditional rendering to keep the flashcard generation tool as the primary focus.
2. Use Shadcn/ui components for consistent popup/toast notifications, especially to inform demo mode users about unsaved flashcards.
3. Develop post-login routing logic that checks for existing study sessions in the database, redirecting appropriately.
4. Design smooth transitions between a candidate tile view and a detailed view, enabling editing in the latter.
5. Create responsive flashcard tile components with flip animations, positioning reject and edit buttons based on screen size (mobile vs. desktop).
6. Position the accept and "reject all" controls appropriately on large screens and as an overlay on mobile.
7. Manage global state using React hooks and context, with scope for future Zustand integration if needed.
8. Integrate a standard JWT flow with UI route guards and consistent error handling via Shadcn/ui toasts.
9. Establish centralized global components for handling API loading states and errors.
10. Apply Tailwind CSS standards to ensure responsiveness and performance across all device types.

</matched_recommendations>.

<ui_architecture_planning_summary>.

The UI architecture for the MVP is designed around a unified view hierarchy that supports both demo (unauthenticated) and authenticated modes while keeping the flashcard generation tool as the central element. The key views include:
- A main screen with the flashcard generation tool, serving as the focal point in both modes.
- Conditional secondary navigation (registration, login, study session) that appears only when applicable.
- A candidate flashcard review interface with two interaction modes: a zoomed-out tile view for quick rejection/deletion and a detailed view for editing and flipping cards.
- Distinct button placements and interactive behaviors for different screen sizes: on mobile, interactive overlay buttons (reject, edit, and accept) ensure usability, while on large screens, controls such as the accept button and "reject all" option with generation statistics are positioned below the navbar.
The application will integrate with APIs using a standard JWT flow with client-side route guarding. State management will be handled using React hooks and context, ensuring clear separation between demo and authenticated data, and centralized components will manage loading spinners and error toasts for consistent UI feedback.
Responsiveness will be achieved using Tailwind CSS, ensuring smooth transitions and interactive elements across devices. Accessibility will follow default practices provided by the UI component libraries, and security concerns related to authentication (like token expiration or invalid tokens) will be managed through error notifications.

</ui_architecture_planning_summary>.

</conversation_summary>