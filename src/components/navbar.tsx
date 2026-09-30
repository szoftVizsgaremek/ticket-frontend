import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Moon,
  PlusCircle,
  Sun,
  Ticket,
  User,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/useAuth";
import { usePermissions } from "@/features/auth/usePermissions";
import { PERMISSIONS } from "@/features/auth/permissions";
import { homeRouteFor } from "@/features/auth/role-routing";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  visible: boolean;
}

function Navbar() {
  const { toggleTheme } = useTheme();
  const { can } = usePermissions();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
      visible: can(PERMISSIONS.DASHBOARD_VIEW),
    },
    {
      label: "Profile",
      to: "/profile",
      icon: User,
      visible: true,
    },
    {
      label: "My Tickets",
      to: "/my-tickets",
      icon: Ticket,
      visible: can(PERMISSIONS.TICKET_VIEW),
    },
    {
      label: "Create Ticket",
      to: "/create-ticket",
      icon: PlusCircle,
      visible: can(PERMISSIONS.TICKET_CREATE),
    },
    {
      label: "New User",
      to: "/create-user",
      icon: UserPlus,
      visible: can(PERMISSIONS.USER_CREATE),
    },
  ].filter((item) => item.visible);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            to={homeRouteFor(user?.role)}
            className="shrink-0 font-semibold tracking-tight"
          >
            Ticket System
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          {can(PERMISSIONS.NOTIFICATION_VIEW) && <NotificationBell />}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <Sun className="hidden dark:block" />
            <Moon className="dark:hidden" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
