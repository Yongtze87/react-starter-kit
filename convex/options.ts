import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  mockGetStockQuote,
  mockGetOptionsChain,
  mockGetExpirationDates,
  mockSearchTickers,
} from "./lib/mockMarketData";

export const getStockQuote = query({
  args: { ticker: v.string() },
  handler: async (_ctx, { ticker }) => {
    return mockGetStockQuote(ticker, new Date());
  },
});

export const getExpirationDates = query({
  args: { ticker: v.string() },
  handler: async (_ctx, { ticker }) => {
    return mockGetExpirationDates(ticker, new Date());
  },
});

export const getOptionsChain = query({
  args: { ticker: v.string(), expiration: v.string() },
  handler: async (_ctx, { ticker, expiration }) => {
    return mockGetOptionsChain(ticker, expiration, new Date());
  },
});

export const searchTickers = query({
  args: { query: v.string() },
  handler: async (_ctx, { query: q }) => {
    if (q.length < 1) return [];
    return mockSearchTickers(q);
  },
});
