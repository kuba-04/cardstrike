import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthForm } from "./AuthForm"
import { AuthError } from "./AuthError"
import { Link } from "@/components/ui/link"

export function LoginForm() {
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setError(null)
        // Form handling will be implemented later
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
                    />
                </div>
                <Button type="submit" className="w-full">
                    Sign in
                </Button>
            </div>
        </AuthForm>
    )
} 