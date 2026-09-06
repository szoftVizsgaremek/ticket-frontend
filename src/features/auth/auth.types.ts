export const ROLES = {
  ADMIN: "ADMIN",
  IT: "IT",
  ENGINEER: "ENGINEER",
  AREA_MANAGER: "AREA_MANAGER",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}
