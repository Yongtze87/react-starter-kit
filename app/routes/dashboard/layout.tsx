import { useLoaderData, useLocation } from "react-router";
import type { Route } from "./+types/layout";
import { Outlet } from "react-router";
import { BottomNav } from "~/components/mobile/bottom-nav";
import { MobileHeader } from "~/components/mobile/mobile-header";

export async function loader(args: Route.LoaderArgs) {
  // TODO: Add Supabase auth check and redirect to /sign-in if not authenticated
  // TODO: Check subscription status and redirect to /subscription-required if needed

  // Placeholder user data for development
  const user = {
    id: "demo-user-id",
    fullName: "Demo User",
    email: "demo@example.com",
    initials: "DU",
    imageUrl: null,
  };

  return { user };
}

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/chat": "AI Assistant",
  "/documents": "Documents",
  "/settings": "Settings",
};

export default function DashboardLayout() {
  const { user } = useLoaderData();
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

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
