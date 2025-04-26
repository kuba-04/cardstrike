import type { LoginFormData, RegisterFormData, ResetPasswordFormData } from "../schemas/auth.schema";

export class AuthService {
  private static async fetchApi(endpoint: string, data: unknown) {
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "An unexpected error occurred");
    }

    return responseData;
  }

  static async login(data: LoginFormData) {
    return this.fetchApi("login", data);
  }

  static async register(data: RegisterFormData) {
    const { confirmPassword, ...registerData } = data;
    return this.fetchApi("register", registerData);
  }

  static async resetPassword(data: ResetPasswordFormData) {
    const { confirmPassword, ...resetData } = data;
    return this.fetchApi("reset-password", resetData);
  }
}
