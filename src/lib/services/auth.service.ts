import type { LoginFormData, RegisterFormData, ResetPasswordFormData } from "../schemas/auth.schema";
import { ErrorService } from "./error.service";

// Convert class with static methods to a function/object structure
const fetchApi = async (endpoint: string, data: unknown) => {
  try {
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
  } catch (error) {
    console.error(`Auth ${endpoint} error:`, error);
    throw new Error(ErrorService.formatError(error));
  }
};

export const AuthService = {
  login: async (data: LoginFormData) => {
    return fetchApi("login", data);
  },

  register: async (data: RegisterFormData) => {
    const { ...registerData } = data;
    return fetchApi("register", registerData);
  },

  resetPassword: async (data: ResetPasswordFormData) => {
    const { ...resetData } = data;
    return fetchApi("reset-password", resetData);
  },
};
