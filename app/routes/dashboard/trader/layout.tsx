import { Link, Outlet, useLocation } from "react-router";
import { Search, BarChart2, Bookmark, User } from "lucide-react";

const TABS = [
  { to: "/dashboard/trader", label: "Search", icon: Search, exact: true },
  { to: "/dashboard/trader/scanner", label: "Scanner", icon: BarChart2, exact: false },
  { to: "/dashboard/trader/watchlist", label: "Watchlist", icon: Bookmark, exact: false },
  { to: "/dashboard/trader/account", label: "Account", icon: User, exact: false },
] as const;

function isActive(tabTo: string, exact: boolean, pathname: string): boolean {
  if (exact) return pathname === tabTo || pathname === tabTo + "/";
  return pathname.startsWith(tabTo);
}

export default function TraderLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B0D] text-[#050F19] dark:text-white flex flex-col">
      {/* Page content */}
      <div className="flex-1 max-w-[760px] w-full mx-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom tab bar — fixed at bottom, centered column */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0A0B0D] border-t border-[#E5E9F0] dark:border-[#1E2330] safe-area-pb">
        <div className="max-w-[760px] mx-auto grid grid-cols-4">
          {TABS.map((tab) => {
            const active = tab.label === "Account"
              ? false // Account page not yet implemented
              : isActive(tab.to, tab.exact, location.pathname);
            const Icon = tab.icon;
            const href = tab.label === "Account" ? "/dashboard/settings" : tab.to;
            return (
              <Link
                key={tab.label}
                to={href}
                className={`flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors ${
                  active
                    ? "text-[#0052FF]"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
