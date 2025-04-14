import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: 1,
        },
    },
});

export default function QueryClientProvider({ children }: PropsWithChildren) {
    return (
        <TanstackQueryClientProvider client={queryClient}>
            {children}
        </TanstackQueryClientProvider>
    );
}