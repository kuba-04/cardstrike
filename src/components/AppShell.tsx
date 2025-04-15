import { type PropsWithChildren } from 'react'
import { Toaster } from "sonner"
import { Navbar } from "@/components/Navbar"
import { Providers } from "@/components/providers/Providers"

export function AppShell({ children }: PropsWithChildren) {
    return (
        <Providers>
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