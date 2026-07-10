import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  STOCK_UNIVERSE,
  generateOptionsChain,
  generateExpirationDates,
} from "./lib/mockMarketData";
import {
  calcMid,
  calcDTE,
  calcDailyCashFlow,
  calcAnnReturnCC,
  calcAnnReturnCSP,
  calcOTMPercent,
  getRiskCategory,
  calcBullPutSpread,
} from "./lib/optionsCalculations";

export interface ScanResult {
  ticker: string;
  name: string;
  price: number;
  strategy: "CC" | "CSP" | "BullPutSpread";
  strike: number;
  shortStrike?: number;
  longStrike?: number;
  expiration: string;
  dte: number;
  dailyCashFlow: number;
  annReturn: number;
  capitalRequired: number;
  riskCategory: "Conservative" | "Moderate" | "Aggressive";
  netPremium?: number;
  breakEven?: number;
}

export const scanAllStocks = query({
  args: {
    strategies: v.optional(v.array(v.union(v.literal("CC"), v.literal("CSP"), v.literal("BullPutSpread")))),
    minDTE: v.optional(v.number()),
    maxDTE: v.optional(v.number()),
    minAnnReturn: v.optional(v.number()),
  },
  handler: async (_ctx, { strategies, minDTE, maxDTE, minAnnReturn }) => {
    const today = new Date();
    const activeStrategies = strategies ?? ["CC", "CSP", "BullPutSpread"];
    const minD = minDTE ?? 7;
    const maxD = maxDTE ?? 90;
    const minR = minAnnReturn ?? 0;

    const results: ScanResult[] = [];

    for (const stock of STOCK_UNIVERSE) {
      const expirations = generateExpirationDates(today, 4);

      for (const expiration of expirations) {
        const dte = calcDTE(expiration, today);
        if (dte < minD || dte > maxD) continue;

        const chain = generateOptionsChain(stock.price, stock.tier, expiration, today);
        const calls = chain.filter((c) => c.optionType === "call");
        const puts = chain.filter((c) => c.optionType === "put");

        // Best CC — highest ann return for calls OTM >= 2%
        if (activeStrategies.includes("CC")) {
          let bestCC: ScanResult | null = null;
          for (const c of calls) {
            const otm = (c.strike - stock.price) / stock.price * 100;
            if (otm < 0) continue; // ITM calls excluded
            const mid = calcMid(c.bid, c.ask);
            if (mid < 0.05) continue;
            const annR = calcAnnReturnCC(mid, stock.price, dte);
            if (annR < minR) continue;
            const daily = calcDailyCashFlow(mid, dte);
            const otmPct = calcOTMPercent(c.strike, stock.price);
            if (!bestCC || annR > bestCC.annReturn) {
              bestCC = {
                ticker: stock.ticker,
                name: stock.name,
                price: stock.price,
                strategy: "CC",
                strike: c.strike,
                expiration,
                dte,
                dailyCashFlow: daily,
                annReturn: annR,
                capitalRequired: stock.price * 100,
                riskCategory: getRiskCategory(otmPct),
                breakEven: c.strike + mid,
              };
            }
          }
          if (bestCC) results.push(bestCC);
        }

        // Best CSP — highest ann return for puts OTM >= 2%
        if (activeStrategies.includes("CSP")) {
          let bestCSP: ScanResult | null = null;
          for (const p of puts) {
            const otm = (stock.price - p.strike) / stock.price * 100;
            if (otm < 0) continue; // ITM puts excluded
            const mid = calcMid(p.bid, p.ask);
            if (mid < 0.05) continue;
            const annR = calcAnnReturnCSP(mid, p.strike, dte);
            if (annR < minR) continue;
            const daily = calcDailyCashFlow(mid, dte);
            const otmPct = calcOTMPercent(p.strike, stock.price);
            if (!bestCSP || annR > bestCSP.annReturn) {
              bestCSP = {
                ticker: stock.ticker,
                name: stock.name,
                price: stock.price,
                strategy: "CSP",
                strike: p.strike,
                expiration,
                dte,
                dailyCashFlow: daily,
                annReturn: annR,
                capitalRequired: p.strike * 100,
                riskCategory: getRiskCategory(otmPct),
                breakEven: p.strike - mid,
              };
            }
          }
          if (bestCSP) results.push(bestCSP);
        }

        // Best Bull Put Spread — $10 wide, best ann return
        if (activeStrategies.includes("BullPutSpread")) {
          let bestSpread: ScanResult | null = null;
          const SPREAD_WIDTH = 10;
          for (const shortPut of puts) {
            const otm = (stock.price - shortPut.strike) / stock.price * 100;
            if (otm < 1) continue; // want short put at least 1% OTM
            // Find long put $SPREAD_WIDTH below
            const longStrike = shortPut.strike - SPREAD_WIDTH;
            const longPut = puts.find((p) => Math.abs(p.strike - longStrike) < 0.01);
            if (!longPut) continue;
            const shortMid = calcMid(shortPut.bid, shortPut.ask);
            const longMid = calcMid(longPut.bid, longPut.ask);
            if (shortMid < longMid) continue;
            const spread = calcBullPutSpread(shortMid, longMid, shortPut.strike, longPut.strike, dte);
            if (spread.annReturn < minR || spread.capitalRequired <= 0) continue;
            if (!bestSpread || spread.annReturn > bestSpread.annReturn) {
              bestSpread = {
                ticker: stock.ticker,
                name: stock.name,
                price: stock.price,
                strategy: "BullPutSpread",
                strike: shortPut.strike,
                shortStrike: shortPut.strike,
                longStrike: longPut.strike,
                expiration,
                dte,
                dailyCashFlow: spread.dailyCashFlow,
                annReturn: spread.annReturn,
                capitalRequired: spread.capitalRequired,
                riskCategory: getRiskCategory(calcOTMPercent(shortPut.strike, stock.price)),
                netPremium: spread.netPremium,
                breakEven: shortPut.strike - spread.netPremium,
              };
            }
          }
          if (bestSpread) results.push(bestSpread);
        }
      }
    }

    // Sort by annualized return descending
    results.sort((a, b) => b.annReturn - a.annReturn);
    return results;
  },
});
