import { ROLES, type Role } from "./auth.types";

export const PERMISSIONS = {
  TICKET_CREATE: "ticket:create",
  TICKET_VIEW: "ticket:view",
  TICKET_EDIT: "ticket:edit",
  TICKET_ASSIGN: "ticket:assign",
  TICKET_CLOSE: "ticket:close",

  ASSET_VIEW: "asset:view",
  ASSET_EDIT: "asset:edit",

  ENGINEER_VIEW: "engineer:view",
  ENGINEER_EDIT: "engineer:edit",

  USER_VIEW: "user:view",
  USER_EDIT: "user:edit",
  USER_CREATE: "user:create",

  NOTIFICATION_VIEW: "notification:view",

  DASHBOARD_VIEW: "dashboard:view",
  ADMIN_ACCESS: "admin:access",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const WORKER_PERMISSIONS: Permission[] = [
  PERMISSIONS.TICKET_CREATE,
  PERMISSIONS.TICKET_VIEW,

  PERMISSIONS.NOTIFICATION_VIEW,
  PERMISSIONS.DASHBOARD_VIEW,
];

const rolePermissions: Record<Role, Permission[]> = {
  // The only role with no restriction at all.
  [ROLES.SUPERADMIN]: [
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_VIEW,
    PERMISSIONS.TICKET_EDIT,
    PERMISSIONS.TICKET_ASSIGN,
    PERMISSIONS.TICKET_CLOSE,

    PERMISSIONS.ASSET_VIEW,
    PERMISSIONS.ASSET_EDIT,

    PERMISSIONS.ENGINEER_VIEW,
    PERMISSIONS.ENGINEER_EDIT,

    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_CREATE,

    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ADMIN_ACCESS,
  ],

  // Provisioning only: creates accounts, sees no dashboard and no tickets.
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.NOTIFICATION_VIEW,
  ],

  [ROLES.AREA_MANAGER]: [
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_VIEW,
    PERMISSIONS.TICKET_EDIT,
    PERMISSIONS.TICKET_ASSIGN,
    PERMISSIONS.TICKET_CLOSE,

    PERMISSIONS.ASSET_VIEW,

    PERMISSIONS.ENGINEER_VIEW,

    PERMISSIONS.USER_VIEW,

    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
  ],

  // The four worker roles are user-level: they report and follow tickets like
  // anyone else. What separates them is the routing rule in
  // features/tickets/ticket-assignment.ts, not a permission.
  [ROLES.OPERATOR]: WORKER_PERMISSIONS,
  [ROLES.TECHNICIAN]: WORKER_PERMISSIONS,
  [ROLES.ENGINEER]: WORKER_PERMISSIONS,
  [ROLES.IT]: WORKER_PERMISSIONS,
};

export function hasPermission(role: Role, permission: Permission): boolean {
  // Unknown roles deny by default rather than throwing, so a role the
  // frontend has not caught up with yet locks the UI down instead of up.
  return rolePermissions[role]?.includes(permission) ?? false;
}
