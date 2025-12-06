import { useLocation } from "react-router";
import { useEffect } from "react";
import { Outlet } from "react-router";
import { BottomNav } from "~/components/mobile/bottom-nav";
import { MobileHeader } from "~/components/mobile/mobile-header";

// Mock user data - no loader needed for instant navigation
const user = {
  id: "demo-user-id",
  fullName: "Demo User",
  email: "demo@example.com",
  initials: "DU",
  imageUrl: null,
};

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/chat": "AI Assistant",
  "/documents": "Documents",
  "/settings": "Settings",
};

export default function DashboardLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  // Debug: Track render timing with more granularity
  useEffect(() => {
    console.timeEnd(`Navigation to ${location.pathname}`);
    console.log(`[LAYOUT] Rendered: ${location.pathname}`);
    console.log(`[PERF] If delay >100ms, it's likely Vercel Analytics pageview tracking (external service call)`);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MobileHeader title={title} user={user} />

      {/* Main content area with padding for header and bottom nav */}
      <main className="flex-1 pb-16 overflow-y-auto">
        <div className="w-full max-w-screen-sm mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
