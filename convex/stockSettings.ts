import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getStockSettings = query({
  args: { ticker: v.string() },
  handler: async (ctx, { ticker }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db
      .query("userStockSettings")
      .withIndex("by_user_ticker", (q) =>
        q.eq("userId", identity.subject).eq("ticker", ticker.toUpperCase())
      )
      .first();
  },
});

export const setStockSettings = mutation({
  args: {
    ticker: v.string(),
    sharesOwned: v.optional(v.number()),
    costBasis: v.optional(v.number()),
  },
  handler: async (ctx, { ticker, sharesOwned, costBasis }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const userId = identity.subject;
    const upper = ticker.toUpperCase();
    const existing = await ctx.db
      .query("userStockSettings")
      .withIndex("by_user_ticker", (q) => q.eq("userId", userId).eq("ticker", upper))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { sharesOwned, costBasis, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("userStockSettings", {
        userId,
        ticker: upper,
        sharesOwned,
        costBasis,
        updatedAt: Date.now(),
      });
    }
  },
});
