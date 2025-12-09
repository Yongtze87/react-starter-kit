import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  Users,
  Inbox,
  Bell
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useState, useEffect } from "react";
import { getViewMode } from "~/lib/utils/view-mode";

const clientNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const adminNavItems = [
  {
    label: "Documents",
    href: "/dashboard/admin/documents",
    icon: FileText,
  },
  {
    label: "Queries",
    href: "/dashboard/admin/queries",
    icon: Inbox,
  },
  {
    label: "Clients",
    href: "/dashboard/admin/clients",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function BottomNav() {
  const location = useLocation();
  const [viewMode, setViewMode] = useState(getViewMode());

  // Listen for view mode changes
  useEffect(() => {
    const handleStorageChange = () => {
      setViewMode(getViewMode());
    };

    // Check every time location changes (e.g., when settings updated)
    handleStorageChange();
  }, [location]);

  const navItems = viewMode === 'admin' ? adminNavItems : clientNavItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm"
      style={{ boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-screen-sm mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              prefetch="render"
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
