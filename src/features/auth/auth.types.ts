export const ROLES = {
  ADMIN: "admin",
  AREA_MANAGER: "area_manager",
  USER: "user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
  birthDate: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  birthDate?: string;
}