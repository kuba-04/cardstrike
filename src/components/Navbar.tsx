import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { toast } from 'sonner';

export function Navbar() {
    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Failed to logout');
            }

            // Redirect to login page after successful logout
            window.location.href = "/";
            toast.success('Successfully logged out');
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to logout');
        }
    };

    return (
        <nav className="border-b bg-background" role="navigation" aria-label="Main navigation">
            <div className="container flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold">
                    CardStrike
                </Link>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-foreground hover:bg-accent hover:text-accent-foreground"
                        aria-label="Log out"
                    >
                        Log out
                    </Button>
                </div>
            </div>
        </nav>
    );
} 