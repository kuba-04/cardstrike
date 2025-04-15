import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthForm } from "./AuthForm"
import { AuthError } from "./AuthError"
import { Link } from "@/components/ui/link"

export function ForgotPasswordForm() {
    const [error, setError] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setError(null)
        setIsSubmitted(true)
        // Form handling will be implemented later
    }

    if (isSubmitted) {
        return (
            <AuthForm
                title="Check your email"
                description="If an account exists with that email, we've sent a password reset link."
                onSubmit={async () => { }}
                footer={
                    <div className="text-sm text-muted-foreground">
                        <Link href="/auth/login">Back to login</Link>
                    </div>
                }
            >
                <div className="text-center text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or try again.
                </div>
            </AuthForm>
        )
    }

    return (
        <AuthForm
            title="Forgot password"
            description="Enter your email address and we'll send you a password reset link"
            onSubmit={handleSubmit}
            footer={
                <div className="text-sm text-muted-foreground">
                    <Link href="/auth/login">Back to login</Link>
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
                <Button type="submit" className="w-full">
                    Send reset link
                </Button>
            </div>
        </AuthForm>
    )
} 