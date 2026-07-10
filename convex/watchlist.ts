import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getWatchlist = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("userWatchlist")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(20);
  },
});

export const addToWatchlist = mutation({
  args: { ticker: v.string() },
  handler: async (ctx, { ticker }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const userId = identity.subject;
    // Avoid duplicates — remove existing entry first, then re-add at top
    const existing = await ctx.db
      .query("userWatchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("ticker"), ticker.toUpperCase()))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { addedAt: Date.now() });
    } else {
      await ctx.db.insert("userWatchlist", {
        userId,
        ticker: ticker.toUpperCase(),
        addedAt: Date.now(),
      });
    }
  },
});

export const removeFromWatchlist = mutation({
  args: { ticker: v.string() },
  handler: async (ctx, { ticker }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const userId = identity.subject;
    const entry = await ctx.db
      .query("userWatchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("ticker"), ticker.toUpperCase()))
      .first();
    if (entry) await ctx.db.delete(entry._id);
  },
});
