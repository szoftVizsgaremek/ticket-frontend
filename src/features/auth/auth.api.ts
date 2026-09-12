import { apiFetch } from "@/lib/api-client";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  User,
} from "./auth.types";

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User>("/api/auth/me");
  } catch {
    return null;
  }
}

export async function login(credentials: LoginRequest): Promise<User> {
  return apiFetch<User>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function forgotPassword(
  input: ForgotPasswordRequest
): Promise<void> {
  await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resetPassword(
  input: ResetPasswordRequest
): Promise<void> {
  await apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}
