import { useLoaderData } from "react-router";
import { AppSidebar } from "~/components/dashboard/app-sidebar";
import { SiteHeader } from "~/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import type { Route } from "./+types/layout";
import { Outlet } from "react-router";

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

export default function DashboardLayout() {
  const { user } = useLoaderData();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
