export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  AREA_MANAGER: "area_manager",
  OPERATOR: "operator",
  TECHNICIAN: "technician",
  ENGINEER: "engineer",
  IT: "it",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPERADMIN]: "Superadmin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.AREA_MANAGER]: "Area manager",
  [ROLES.OPERATOR]: "Operator",
  [ROLES.TECHNICIAN]: "Technician",
  [ROLES.ENGINEER]: "Engineer",
  [ROLES.IT]: "IT",
};

// Which roles an account may hand out when creating a user. Mirrors
// CREATABLE_ROLES in the backend (mariadb_backend/src/roles.js) — the backend
// re-checks this, so this list only drives the dropdown.
export const CREATABLE_ROLES: Record<Role, Role[]> = {
  [ROLES.SUPERADMIN]: [
    ROLES.SUPERADMIN,
    ROLES.ADMIN,
    ROLES.AREA_MANAGER,
    ROLES.OPERATOR,
    ROLES.TECHNICIAN,
    ROLES.ENGINEER,
    ROLES.IT,
  ],
  [ROLES.ADMIN]: [
    ROLES.OPERATOR,
    ROLES.TECHNICIAN,
    ROLES.ENGINEER,
    ROLES.IT,
  ],
  [ROLES.AREA_MANAGER]: [],
  [ROLES.OPERATOR]: [],
  [ROLES.TECHNICIAN]: [],
  [ROLES.ENGINEER]: [],
  [ROLES.IT]: [],
};

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

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  birthDate?: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}