import { type PropsWithChildren } from "react";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/providers/Providers";
import type { User } from "@supabase/supabase-js";

interface AppShellProps extends PropsWithChildren {
  initialUser: Pick<User, "id" | "email">;
  hideNav?: boolean;
}

export function AppShell({ children, initialUser, hideNav = false }: AppShellProps) {
  return (
    <Providers initialUser={initialUser}>
      <div className="flex min-h-screen flex-col">
        {!hideNav && <Navbar variant="default" />}
        <main className="flex-1">{children}</main>
      </div>
    </Providers>
  );
}
