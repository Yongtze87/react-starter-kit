import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("api/chat", "routes/api.chat.tsx"),
  index("routes/home.tsx"),
  route("sign-in/*", "routes/sign-in.tsx"),
  route("sign-up/*", "routes/sign-up.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("success", "routes/success.tsx"),
  route("subscription-required", "routes/subscription-required.tsx"),
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/chat", "routes/dashboard/chat.tsx"),
    route("dashboard/documents", "routes/dashboard/documents.tsx"),
    route("dashboard/settings", "routes/dashboard/settings.tsx"),
    route("dashboard/admin/documents", "routes/dashboard/admin.documents.tsx"),
    route("dashboard/admin/queries", "routes/dashboard/admin.queries.tsx"),
    route("dashboard/admin/clients", "routes/dashboard/admin.clients.tsx"),
  ]),
] satisfies RouteConfig;
