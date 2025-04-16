import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthForm } from "./AuthForm"
import { AuthError } from "./AuthError"
import { Link } from "@/components/ui/link"
import { toast } from "sonner"

export function RegisterForm() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        try {
            setError(null)
            setIsLoading(true)

            const email = formData.get('email') as string
            const password = formData.get('password') as string
            const confirmPassword = formData.get('confirmPassword') as string
            const username = formData.get('username') as string

            if (password !== confirmPassword) {
                throw new Error("Passwords don't match")
            }

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    username,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register')
            }

            toast.success('Registration successful! Please check your email to verify your account.')
            window.location.href = '/auth/login'
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
            toast.error(err instanceof Error ? err.message : 'Failed to register')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthForm
            title="Create an account"
            description="Enter your details to create your account"
            onSubmit={handleSubmit}
            footer={
                <div className="text-sm text-muted-foreground">
                    <Link href="/auth/login">Already have an account? Sign in</Link>
                </div>
            }
        >
            <div className="grid gap-4">
                <AuthError error={error} />
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        autoComplete="username"
                        disabled={isLoading}
                    />
                </div>
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
                        autoComplete="new-password"
                        disabled={isLoading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        autoComplete="new-password"
                        disabled={isLoading}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
            </div>
        </AuthForm>
    )
} 