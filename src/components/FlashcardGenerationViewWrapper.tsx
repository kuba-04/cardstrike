import { Providers } from "@/components/providers/Providers";
import { FlashcardGenerationView } from "./FlashcardGenerationView";
import type { User } from '@supabase/supabase-js';

interface FlashcardGenerationViewWrapperProps {
    initialUser: Pick<User, 'id' | 'email'>;
}

export function FlashcardGenerationViewWrapper({ initialUser }: FlashcardGenerationViewWrapperProps) {
    return (
        <Providers initialUser={initialUser}>
            <FlashcardGenerationView />
        </Providers>
    );
} 