import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Moon,
  PlusCircle,
  Sun,
  Ticket,
  User,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/features/auth/usePermissions";
import { PERMISSIONS } from "@/features/auth/permissions";

function Navbar() {
  const { toggleTheme } = useTheme();
  const { can } = usePermissions();

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Profile", to: "/profile", icon: User },
    { label: "My Tickets", to: "/my-tickets", icon: Ticket },
    { label: "Create Ticket", to: "/create-ticket", icon: PlusCircle },
    ...(can(PERMISSIONS.USER_CREATE)
      ? [{ label: "New User", to: "/create-user", icon: UserPlus }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            to="/dashboard"
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
      </div>
    </header>
  );
}

export default Navbar;