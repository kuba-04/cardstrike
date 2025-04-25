import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthForm } from "./AuthForm"
import { AuthError } from "./AuthError"
import { useNavigate } from "@/hooks/useNavigate"
import { useAuthForm } from "@/hooks/useAuthForm"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/schemas/auth.schema"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { AuthService } from "@/lib/services/auth.service"

export function ResetPasswordForm() {
    const navigate = useNavigate()

    const { form, error, isSubmitting, handleSubmit } = useAuthForm<ResetPasswordFormData>({
        schema: resetPasswordSchema,
        onSubmit: async (data) => {
            await AuthService.resetPassword(data)
            // Redirect to dashboard after successful password reset and auto-login
            navigate('/dashboard')
        }
    })

    return (
        <AuthForm
            form={form}
            onSubmit={handleSubmit}
            title="Reset password"
            description="Enter your new password"
            isSubmitting={isSubmitting}
        >
            <div className="grid gap-4">
                <AuthError error={error} />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    autoComplete="new-password"
                                    disabled={isSubmitting}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    autoComplete="new-password"
                                    disabled={isSubmitting}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Resetting...' : 'Reset password'}
                </Button>
            </div>
        </AuthForm>
    )
} 