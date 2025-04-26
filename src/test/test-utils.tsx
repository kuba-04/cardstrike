import { render as testingLibraryRender } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";

// Custom render function that includes providers
export function render(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...testingLibraryRender(ui, {
      wrapper: ({ children }) => (
        <>
          {children}
          <Toaster />
        </>
      ),
    }),
  };
}

// Common test data
export const mockFlashcard = {
  id: 1,
  front_text: "Test Front",
  back_text: "Test Back",
  is_ai: true,
  created_at: new Date().toISOString(),
  user_id: "test-user",
};

export const mockCandidate = {
  candidate_id: "1",
  front_text: "Test Front",
  back_text: "Test Back",
  original_front_text: "Test Front",
  original_back_text: "Test Back",
  local_status: "pending" as const,
  is_saving_edit: false,
  is_rejecting: false,
};

// Mock fetch responses
export const mockApiResponse = <T,>(data: T) => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  };
};

// Common test ids
export const testIds = {
  frontText: "front-text",
  backText: "back-text",
  saveButton: "save-button",
  cancelButton: "cancel-button",
  deleteButton: "delete-button",
  editButton: "edit-button",
  rejectButton: "reject-button",
};
