import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { hasPermission, type Permission } from "@/features/auth/permissions";
import { homeRouteFor } from "@/features/auth/role-routing";
import { useAuth } from "@/features/auth/useAuth";

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
}

export function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasPermission(user.role, permission)) {
    return <Navigate to={homeRouteFor(user.role)} replace />;
  }

  return <>{children}</>;
}

// Sends signed-out visitors to /login and everyone else to the landing page
// their role actually has access to.
export function LandingRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return <Navigate to={homeRouteFor(user?.role)} replace />;
}
