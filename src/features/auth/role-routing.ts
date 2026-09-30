import { PERMISSIONS, hasPermission } from "./permissions";
import type { Role } from "./auth.types";

// Where a role lands after logging in, and where it is sent when it tries to
// open a page it has no permission for. An admin has no dashboard, so it goes
// straight to the account-provisioning page.
export function homeRouteFor(role: Role | undefined): string {
  if (!role) return "/login";
  if (hasPermission(role, PERMISSIONS.DASHBOARD_VIEW)) return "/dashboard";
  if (hasPermission(role, PERMISSIONS.USER_CREATE)) return "/create-user";
  return "/profile";
}
