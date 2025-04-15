import type { User } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import FlashcardList from './FlashcardList';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

interface FlashcardListWrapperProps {
    initialUser: Pick<User, 'id' | 'email'>;
}

export default function FlashcardListWrapper({ initialUser }: FlashcardListWrapperProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <FlashcardList initialUser={initialUser} />
            <Toaster richColors position="top-right" />
        </QueryClientProvider>
    );
} 