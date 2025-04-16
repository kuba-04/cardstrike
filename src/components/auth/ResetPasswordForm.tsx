import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthForm } from "./AuthForm"
import { AuthError } from "./AuthError"
import { useNavigate } from "@/hooks/useNavigate"

export function ResetPasswordForm() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (formData: FormData) => {
        try {
            setError(null)
            setIsLoading(true)

            const password = formData.get('password') as string
            const confirmPassword = formData.get('confirmPassword') as string

            if (password !== confirmPassword) {
                throw new Error("Passwords don't match")
            }

            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters')
            }

            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password')
            }

            // Redirect to dashboard after successful password reset and auto-login
            navigate('/dashboard')
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthForm
            title="Reset password"
            description="Enter your new password"
            onSubmit={handleSubmit}
        >
            <div className="grid gap-4">
                <AuthError error={error} />
                <div className="grid gap-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        disabled={isLoading}
                        minLength={8}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        autoComplete="new-password"
                        disabled={isLoading}
                        minLength={8}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Resetting...' : 'Reset password'}
                </Button>
            </div>
        </AuthForm>
    )
} 