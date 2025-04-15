import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthForm } from "./AuthForm"
import { AuthError } from "./AuthError"
import { Link } from "@/components/ui/link"
import { useAuth } from "../providers/AuthProvider"
import { toast } from "sonner"

export function LoginForm() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { signIn } = useAuth()

    const handleSubmit = async (formData: FormData) => {
        try {
            setError(null)
            setIsLoading(true)

            const email = formData.get('email') as string
            const password = formData.get('password') as string

            await signIn(email, password)
            toast.success('Successfully signed in')
            window.location.href = '/'
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
            toast.error(err instanceof Error ? err.message : 'Failed to sign in')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthForm
            title="Welcome back"
            description="Enter your email to sign in to your account"
            onSubmit={handleSubmit}
            footer={
                <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                    <Link href="/auth/register">Don't have an account? Sign up</Link>
                    <Link href="/auth/forgot-password">Forgot your password?</Link>
                </div>
            }
        >
            <div className="grid gap-4">
                <AuthError error={error} />
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        autoComplete="email"
                        disabled={isLoading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        disabled={isLoading}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
            </div>
        </AuthForm>
    )
} 