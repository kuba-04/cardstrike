export class DemoSessionService {
    private static readonly DEMO_SESSION_KEY = 'demo_generation_used';

    private static isStorageAvailable(): boolean {
        try {
            return typeof window !== 'undefined' && !!window.sessionStorage;
        } catch {
            return false;
        }
    }

    public static hasUsedGeneration(): boolean {
        if (!this.isStorageAvailable()) {
            return false;
        }
        return sessionStorage.getItem(this.DEMO_SESSION_KEY) === 'true';
    }

    public static markGenerationUsed(): void {
        if (!this.isStorageAvailable()) {
            return;
        }
        sessionStorage.setItem(this.DEMO_SESSION_KEY, 'true');
    }

    public static reset(): void {
        if (!this.isStorageAvailable()) {
            return;
        }
        sessionStorage.removeItem(this.DEMO_SESSION_KEY);
    }
} 