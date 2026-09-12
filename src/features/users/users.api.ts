import { apiFetch } from "@/lib/api-client";
import type { User } from "@/features/auth/auth.types";

export async function fetchUsers(): Promise<User[]> {
  return apiFetch<User[]>("/api/users");
}

export async function fetchUser(id: number): Promise<User> {
  return apiFetch<User>(`/api/users/${id}`);
}