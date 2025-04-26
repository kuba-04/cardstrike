import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { AuthError } from "./AuthError";
import { AuthForm } from "./AuthForm";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form for the initial view
  const form = useForm();
  // Empty form for the success view
  const emptyForm = useForm();

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const email = form.getValues("email") as string;
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset instructions");
      }

      setIsSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthForm
        form={emptyForm}
        title="Check your email"
        description="If an account exists with that email, we've sent a password reset link."
        onSubmit={async () => {
          return Promise.resolve();
        }}
        footer={
          <div className="text-sm text-muted-foreground">
            <Link href="/auth/login">Back to login</Link>
          </div>
        }
      >
        <div className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or try again.
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      form={form}
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
            {...form.register("email", { required: true })}
            type="email"
            placeholder="name@example.com"
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </div>
    </AuthForm>
  );
}
