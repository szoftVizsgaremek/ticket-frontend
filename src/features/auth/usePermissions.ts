import { useAuth } from "./useAuth";
import { hasPermission, type Permission } from "./permissions";

export function usePermissions() {
  const { user } = useAuth();

  function can(permission: Permission) {
    if (!user) {
      return false;
    }

    return hasPermission(user.role, permission);
  }

  return {
    can,
  };
}
