import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sign-in/*", "routes/sign-in.tsx"),
  route("sign-up/*", "routes/sign-up.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("success", "routes/success.tsx"),
  route("subscription-required", "routes/subscription-required.tsx"),
  layout("routes/dashboard/layout.tsx", [
    // Legacy starter kit pages
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/chat", "routes/dashboard/chat.tsx"),
    route("dashboard/settings", "routes/dashboard/settings.tsx"),
    // Premia trader app
    layout("routes/dashboard/trader/layout.tsx", [
      route("dashboard/trader", "routes/dashboard/trader/index.tsx"),
      route("dashboard/trader/scanner", "routes/dashboard/trader/scanner.tsx"),
      route("dashboard/trader/watchlist", "routes/dashboard/trader/watchlist.tsx"),
      route("dashboard/trader/:ticker", "routes/dashboard/trader/ticker.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
