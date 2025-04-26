// Constants
const DEMO_SESSION_KEY = "demo_generation_used";

// Helper functions
const isStorageAvailable = (): boolean => {
  try {
    return typeof window !== "undefined" && !!window.sessionStorage;
  } catch {
    return false;
  }
};

/**
 * Service for tracking demo session state
 */
export const DemoSessionService = {
  /**
   * Check if the user has already used their demo generation
   */
  hasUsedGeneration: (): boolean => {
    if (!isStorageAvailable()) {
      return false;
    }
    return sessionStorage.getItem(DEMO_SESSION_KEY) === "true";
  },

  /**
   * Mark that the user has used their demo generation
   */
  markGenerationUsed: (): void => {
    if (!isStorageAvailable()) {
      return;
    }
    sessionStorage.setItem(DEMO_SESSION_KEY, "true");
  },

  /**
   * Reset the demo session state
   */
  reset: (): void => {
    if (!isStorageAvailable()) {
      return;
    }
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  },
};
