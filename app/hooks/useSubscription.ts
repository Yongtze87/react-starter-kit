// Phase 1 stub — all users treated as Pro.
// In Phase 2, replace with: useQuery(api.subscriptions.checkUserSubscriptionStatus, ...)

export type PlanTier = "free" | "pro";

export function useSubscription(): { tier: PlanTier; isPro: boolean; isLoading: false } {
  return { tier: "pro", isPro: true, isLoading: false };
}
