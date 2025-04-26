# Authentication System Technical Specification

## 1. Overview

This document outlines the technical architecture for implementing user registration, login, and password recovery functionality in the CardStrike Flashcards application. The implementation leverages Supabase Auth for secure authentication while maintaining compatibility with Astro's server-side rendering capabilities.

## 2. User Interface Architecture

### 2.1 Authentication Pages

New Astro pages to be created in `src/pages/auth/`:

- `register.astro`: User registration form
- `login.astro`: Login form
- `forgot-password.astro`: Password recovery request form
- `reset-password.astro`: Password reset form
- `verify-email.astro`: Email verification confirmation page

### 2.2 React Components

New components to be created in `src/components/auth/`:

```typescript
// AuthForm.tsx - Base form component with shared styling
interface AuthFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  children: React.ReactNode;
}

// RegisterForm.tsx - Registration form component
interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

// LoginForm.tsx - Login form component
interface LoginFormData {
  email: string;
  password: string;
}

// ForgotPasswordForm.tsx - Password recovery request form
interface ForgotPasswordFormData {
  email: string;
}

// ResetPasswordForm.tsx - New password form
interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}
```

### 2.3 Form Validation

Using Zod for form validation:

```typescript
// src/lib/validations/auth.ts
import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    username: z.string().min(3, "Username must be at least 3 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

### 2.4 Error Handling UI

Create a shared error component for displaying authentication errors:

```typescript
// src/components/auth/AuthError.tsx
interface AuthErrorProps {
  error: string | null;
}
```

## 3. Backend Architecture

### 3.1 API Endpoints

New endpoints to be created in `src/pages/api/auth/`:

```typescript
// register.ts
export const POST: APIRoute = async ({ request, locals }) => {
  const { email, password, username } = await request.json();
  // Register user via Supabase Auth
  // Create user record in users table
};

// login.ts
export const POST: APIRoute = async ({ request, locals }) => {
  const { email, password } = await request.json();
  // Sign in user via Supabase Auth
  // Set session cookie
};

// logout.ts
export const POST: APIRoute = async ({ locals }) => {
  // Sign out user via Supabase Auth
  // Clear session cookie
};

// forgot-password.ts
export const POST: APIRoute = async ({ request, locals }) => {
  const { email } = await request.json();
  // Send password reset email via Supabase Auth
};

// reset-password.ts
export const POST: APIRoute = async ({ request, locals }) => {
  const { password } = await request.json();
  // Reset password via Supabase Auth
};

// Added missing delete-account endpoint
export const DELETE: APIRoute = async ({ request, locals }) => {
  // Delete user account via Supabase Auth
  // Also remove associated flashcards from the database
};
```

### 3.2 Authentication Service

Create a new service to handle authentication logic:

```typescript
// src/lib/services/auth.service.ts
export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  async register(data: RegisterFormData): Promise<AuthResponse> {
    // Handle registration logic
  }

  async login(data: LoginFormData): Promise<AuthResponse> {
    // Handle login logic
  }

  async logout(): Promise<void> {
    // Handle logout logic
  }

  async forgotPassword(email: string): Promise<void> {
    // Handle password reset request
  }

  async resetPassword(token: string, password: string): Promise<void> {
    // Handle password reset
  }

  async verifyEmail(token: string): Promise<void> {
    // Handle email verification
  }

  // Added missing deleteAccount method
  async deleteAccount(): Promise<void> {
    // Handle account deletion logic by removing the user from Supabase Auth
    // and cleaning up associated flashcards from the database
  }
}
```

## 4. Authentication Flow

### 4.1 Registration Flow

1. User submits registration form
2. Client-side validation using Zod schemas
3. Form data sent to `/api/auth/register` endpoint
4. Server validates input
5. Creates user in Supabase Auth
6. Creates user record in database
7. Sends verification email
8. Redirects to login page with success message

### 4.2 Login Flow

1. User submits login form
2. Client-side validation
3. Form data sent to `/api/auth/login` endpoint
4. Server authenticates via Supabase
5. Sets session cookie
6. Redirects to dashboard

### 4.3 Password Recovery Flow

1. User requests password reset
2. Server sends reset email via Supabase
3. User clicks reset link
4. User sets new password
5. Server updates password via Supabase
6. Redirects to login

## 5. Security Measures

### 5.1 Session Management

- Use Supabase session management
- Store session in HTTP-only cookies
- Implement CSRF protection
- Set secure cookie flags in production

### 5.2 Password Security

- Enforce minimum password requirements
- Use Supabase's built-in password hashing
- Implement rate limiting on auth endpoints
- Set maximum password attempts

### 5.3 Email Verification

- Require email verification for new accounts
- Set expiration on verification tokens
- Implement secure token validation

## 6. Demo Mode Implementation

For unlogged users (US-011 and US-012):

1. Create a session-based token for demo users
2. Store demo state in session storage
3. Implement middleware to check demo status
4. Add clear messaging about temporary nature
5. Restrict generation to one attempt per session
6. Ensure that subsequent flashcard generation attempts by demo users return an error message indicating that generation is limited to one attempt per session.

## 7. Integration Points

### 7.1 Middleware Integration

Update `src/middleware/index.ts`:

```typescript
export const onRequest = defineMiddleware(async ({ locals, cookies }, next) => {
  // Initialize Supabase client
  locals.supabase = supabaseClient;

  // Check for auth session
  const accessToken = cookies.get("sb-access-token");
  if (accessToken) {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();
    if (session) {
      locals.session = session;
    }
  }

  // Check for demo session
  const demoToken = cookies.get("demo-session");
  if (demoToken) {
    locals.isDemo = true;
  }

  return next();
});
```

### 7.2 Protected Routes

Create a higher-order component for protected routes:

```typescript
// src/components/auth/ProtectedRoute.tsx
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check for auth session
  // Redirect to login if not authenticated
  return <>{children}</>;
};
```

## 8. Error Handling

### 8.1 Error Types

```typescript
// src/lib/errors/auth.errors.ts
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
  }
}

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "auth/invalid-credentials",
  EMAIL_IN_USE: "auth/email-already-in-use",
  WEAK_PASSWORD: "auth/weak-password",
  // ... other error codes
} as const;
```

### 8.2 Error Responses

Standardized error response format:

```typescript
interface AuthErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
```
