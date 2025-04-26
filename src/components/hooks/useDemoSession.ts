import { useEffect, useState } from "react";
import { DemoSessionService } from "../../lib/services/demo-session.service";
import { useAuth } from "../providers/AuthProvider";

export function useDemoSession() {
  const { user } = useAuth();
  const [hasUsedGeneration, setHasUsedGeneration] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run this effect once the auth state is determined
    if (!isInitialized) {
      setHasUsedGeneration(DemoSessionService.hasUsedGeneration());
      setIsInitialized(true);
      return;
    }

    // Reset demo session if user logs in
    if (user) {
      DemoSessionService.reset();
      setHasUsedGeneration(false);
      return;
    }

    // Check if demo generation was used
    setHasUsedGeneration(DemoSessionService.hasUsedGeneration());
  }, [user, isInitialized]);

  const markGenerationUsed = () => {
    DemoSessionService.markGenerationUsed();
    setHasUsedGeneration(true);
  };

  return {
    hasUsedGeneration: isInitialized ? hasUsedGeneration : false,
    markGenerationUsed,
    isDemo: !user,
  };
}
