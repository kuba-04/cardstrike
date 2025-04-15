import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { toast } from 'sonner';
import { useAuth } from "./providers/AuthProvider";
import { LoadingIndicator } from "./ui/loading-indicator";

export function Navbar() {
    const { user, loading, signOut } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
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
                    {loading ? (
                        <LoadingIndicator />
                    ) : user ? (
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="text-foreground hover:bg-accent hover:text-accent-foreground"
                            aria-label="Log out"
                        >
                            Log out
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            asChild
                            className="text-foreground hover:bg-accent hover:text-accent-foreground"
                            aria-label="Log in"
                        >
                            <Link href="/auth/login">Log in</Link>
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
} 