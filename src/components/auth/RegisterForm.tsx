import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthForm } from "./AuthForm"
import { AuthError } from "./AuthError"
import { Link } from "@/components/ui/link"

export function RegisterForm() {
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setError(null)
        // Form handling will be implemented later
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
                    />
                </div>
                <Button type="submit" className="w-full">
                    Create account
                </Button>
            </div>
        </AuthForm>
    )
} 