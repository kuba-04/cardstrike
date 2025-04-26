import { Providers } from "@/components/providers/Providers";
import { LoginForm } from "./LoginForm";

export function LoginFormWrapper() {
  return (
    <Providers initialUser={{ id: "", email: "" }}>
      <LoginForm />
    </Providers>
  );
}
