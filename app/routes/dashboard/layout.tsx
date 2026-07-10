import { getAuth } from "@clerk/react-router/ssr.server";
import { redirect, Outlet } from "react-router";
import type { Route } from "./+types/layout";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  if (!userId) throw redirect("/sign-in");
  return { userId };
}

export default function DashboardLayout() {
  return <Outlet />;
}
