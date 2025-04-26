import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { useAuthForm } from "@/hooks/useAuthForm";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.schema";
import { toast } from "sonner";
import { useAuth } from "../providers/AuthProvider";
import { AuthError } from "./AuthError";
import { AuthForm } from "./AuthForm";
import { useEffect, useRef } from "react";

export function LoginForm() {
  const { signIn } = useAuth();
  const redirectRef = useRef<string | null>(null);

  const { form, error, isSubmitting, handleSubmit } = useAuthForm<LoginFormData>({
    schema: loginSchema,
    onSubmit: async (data) => {
      await signIn(data.email, data.password);
      toast.success("Successfully signed in");
      // Store redirect URL rather than directly modifying window.location
      redirectRef.current = "/?panel=collections";
    },
  });

  // Use effect to handle navigation after successful sign-in
  useEffect(() => {
    if (redirectRef.current) {
      window.location.href = redirectRef.current;
      redirectRef.current = null;
    }
  }, [redirectRef.current]);

  return (
    <AuthForm
      form={form}
      onSubmit={handleSubmit}
      title="Welcome back"
      description="Enter your email to sign in to your account"
      footer={
        <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
          <Link href="/auth/register">Don&apos;t have an account? Sign up</Link>
          <Link href="/auth/forgot-password">Forgot your password?</Link>
        </div>
      }
    >
      <div className="grid gap-4">
        <AuthError error={error} />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </AuthForm>
  );
}
