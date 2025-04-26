import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthForm } from "./AuthForm";
import { AuthError } from "./AuthError";
import { Link } from "@/components/ui/link";
import { toast } from "sonner";
import { useAuthForm } from "@/hooks/useAuthForm";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth.schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { AuthService } from "@/lib/services/auth.service";

export function RegisterForm() {
  const { form, error, isSubmitting, handleSubmit } = useAuthForm<RegisterFormData>({
    schema: registerSchema,
    onSubmit: async (data) => {
      await AuthService.register(data);
      toast.success("Registration successful! Please check your email to verify your account.");
      window.location.href = "/";
    },
  });

  return (
    <AuthForm
      form={form}
      onSubmit={handleSubmit}
      title="Create an account"
      description="Enter your details to create your account"
      isSubmitting={isSubmitting}
      footer={
        <div className="text-sm text-muted-foreground">
          <Link href="/auth/login">Already have an account? Sign in</Link>
        </div>
      }
    >
      <div className="grid gap-4">
        <AuthError error={error} />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="username" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                <Input type="password" autoComplete="new-password" disabled={isSubmitting} {...field} />
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
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </div>
    </AuthForm>
  );
}
