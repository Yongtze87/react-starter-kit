import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  optionsCache: defineTable({
    ticker: v.string(),
    expiration: v.string(),
    fetchedAt: v.number(),
    data: v.any(),
  }).index("by_ticker_expiry", ["ticker", "expiration"]),

  stockQuoteCache: defineTable({
    ticker: v.string(),
    fetchedAt: v.number(),
    price: v.number(),
    weekHigh52: v.number(),
    weekLow52: v.number(),
    name: v.string(),
  }).index("by_ticker", ["ticker"]),

  userWatchlist: defineTable({
    userId: v.string(),
    ticker: v.string(),
    addedAt: v.number(),
  }).index("by_user", ["userId"]),

  userStockSettings: defineTable({
    userId: v.string(),
    ticker: v.string(),
    sharesOwned: v.optional(v.number()),
    costBasis: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_ticker", ["userId", "ticker"]),

  userTutorialState: defineTable({
    userId: v.string(),
    onboardingCompleted: v.boolean(),
    conceptCardsCompleted: v.boolean(),
    seenCoachMarks: v.array(v.string()),
    onboardingGoal: v.optional(
      v.union(v.literal("cc"), v.literal("csp"), v.literal("explore"))
    ),
    onboardingCapital: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  portfolioPositions: defineTable({
    userId: v.string(),
    ticker: v.string(),
    strategy: v.union(
      v.literal("CC"),
      v.literal("CSP"),
      v.literal("BullPutSpread"),
      v.literal("IronCondor")
    ),
    strike: v.optional(v.number()),
    shortStrike: v.optional(v.number()),
    longStrike: v.optional(v.number()),
    shortCallStrike: v.optional(v.number()),
    longCallStrike: v.optional(v.number()),
    shortPutStrike: v.optional(v.number()),
    longPutStrike: v.optional(v.number()),
    expiration: v.string(),
    entryDate: v.number(),
    entryPremium: v.number(),
    entryUnderlyingPrice: v.number(),
    quantity: v.number(),
    status: v.union(
      v.literal("open"),
      v.literal("closed"),
      v.literal("expired_worthless"),
      v.literal("assigned")
    ),
    sharesCostBasis: v.optional(v.number()),
    closeDate: v.optional(v.number()),
    closePremium: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),

  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  subscriptions: defineTable({
    userId: v.optional(v.string()),
    polarId: v.optional(v.string()),
    polarPriceId: v.optional(v.string()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    amount: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    customerCancellationReason: v.optional(v.string()),
    customerCancellationComment: v.optional(v.string()),
    metadata: v.optional(v.any()),
    customFieldData: v.optional(v.any()),
    customerId: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("polarId", ["polarId"]),
  webhookEvents: defineTable({
    type: v.string(),
    polarEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
  })
    .index("type", ["type"])
    .index("polarEventId", ["polarEventId"]),
});
