import { apiFetch } from "@/lib/api-client";
import type { CreateUserRequest, User } from "@/features/auth/auth.types";

export async function fetchUsers(): Promise<User[]> {
  return apiFetch<User[]>("/api/users");
}

export async function fetchUser(id: number): Promise<User> {
  return apiFetch<User>(`/api/users/${id}`);
}

export async function createUser(input: CreateUserRequest): Promise<User> {
  return apiFetch<User>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}