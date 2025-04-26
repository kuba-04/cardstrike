import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthForm } from "./AuthForm";
import { AuthError } from "./AuthError";
import { Link } from "@/components/ui/link";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "sonner";
import { useAuthForm } from "@/hooks/useAuthForm";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export function LoginForm() {
  const { signIn } = useAuth();

  const { form, error, isSubmitting, handleSubmit } = useAuthForm<LoginFormData>({
    schema: loginSchema,
    onSubmit: async (data) => {
      await signIn(data.email, data.password);
      toast.success("Successfully signed in");
      window.location.href = "/?panel=collections";
    },
  });

  return (
    <AuthForm
      form={form}
      onSubmit={handleSubmit}
      title="Welcome back"
      description="Enter your email to sign in to your account"
      isSubmitting={isSubmitting}
      footer={
        <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
          <Link href="/auth/register">Don't have an account? Sign up</Link>
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
