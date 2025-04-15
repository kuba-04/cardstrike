import { type PropsWithChildren } from 'react'
import { Toaster } from "sonner"
import { Navbar } from "@/components/Navbar"
import { Providers } from "@/components/providers/Providers"
import type { User } from '@supabase/supabase-js'

interface AppShellProps extends PropsWithChildren {
    initialUser: Pick<User, 'id' | 'email'>
}

export function AppShell({ children, initialUser }: AppShellProps) {
    return (
        <Providers initialUser={initialUser}>
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                    {children}
                </main>
                <Toaster richColors closeButton />
            </div>
        </Providers>
    )
} 