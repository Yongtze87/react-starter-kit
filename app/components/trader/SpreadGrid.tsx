import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { calcDTE, calcBullPutSpread } from "~/lib/optionsCalculations";
import { RiskBadge } from "./RiskBadge";

interface Props {
  ticker: string;
  stockPrice: number;
  expirations: string[];
}

const SPREAD_WIDTHS = [5, 10, 15, 20] as const;

export function SpreadGrid({ ticker, stockPrice, expirations }: Props) {
  const [spreadWidth, setSpreadWidth] = useState<number>(10);
  const [selectedExpiry, setSelectedExpiry] = useState(expirations[0] ?? "");

  const chain = useQuery(
    api.options.getOptionsChain,
    selectedExpiry ? { ticker, expiration: selectedExpiry } : "skip"
  );

  const puts = (chain ?? []).filter((c) => c.optionType === "put");
  const dte = selectedExpiry ? calcDTE(selectedExpiry) : 30;

  // Find spread results
  const spreads = puts
    .filter((shortPut) => {
      const otm = (stockPrice - shortPut.strike) / stockPrice * 100;
      return otm >= 1;
    })
    .map((shortPut) => {
      const longStrike = shortPut.strike - spreadWidth;
      const longPut = puts.find((p) => Math.abs(p.strike - longStrike) < 0.01);
      if (!longPut) return null;
      const shortMid = shortPut.mid;
      const longMid = longPut.mid;
      if (shortMid <= longMid) return null;
      const result = calcBullPutSpread(shortMid, longMid, shortPut.strike, longPut.strike, dte);
      if (result.capitalRequired <= 0 || result.annReturn <= 0) return null;
      const otmPct = (stockPrice - shortPut.strike) / stockPrice * 100;
      const risk: "Conservative" | "Moderate" | "Aggressive" =
        otmPct >= 10 ? "Conservative" : otmPct >= 5 ? "Moderate" : "Aggressive";
      return {
        shortStrike: shortPut.strike,
        longStrike: longPut.strike,
        ...result,
        risk,
        shortMid,
        longMid,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => b.annReturn - a.annReturn)
    .slice(0, 10);

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Expiry</label>
          <select
            value={selectedExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
            className="block mt-0.5 border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] rounded-lg px-2 py-1.5 text-sm outline-none"
          >
            {expirations.map((exp) => {
              const label = new Date(exp + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return <option key={exp} value={exp}>{label} ({calcDTE(exp)}d)</option>;
            })}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Spread width</label>
          <div className="flex gap-1 mt-0.5">
            {SPREAD_WIDTHS.map((w) => (
              <button
                key={w}
                onClick={() => setSpreadWidth(w)}
                className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  spreadWidth === w
                    ? "bg-[#0052FF] text-white"
                    : "border border-[#E5E9F0] dark:border-[#1E2330] hover:border-[#0052FF]"
                }`}
              >
                ${w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!chain && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-[#F5F8FF] dark:bg-[#13171F] animate-pulse" />)}</div>}

      {chain && spreads.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No valid spreads found for this expiry and width</p>
      )}

      {spreads.length > 0 && (
        <div className="space-y-2">
          {spreads.map((s, i) => (
            <div
              key={s.shortStrike}
              className={`rounded-xl border p-4 ${i === 0 ? "border-[#0052FF]" : "border-[#E5E9F0] dark:border-[#1E2330]"} bg-white dark:bg-[#13171F]`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold tabular-nums">${s.shortStrike} / ${s.longStrike} put spread</span>
                  {i === 0 && <span className="ml-2 text-xs text-[#0052FF] font-medium">Best</span>}
                </div>
                <RiskBadge risk={s.risk} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Daily</p>
                  <p className="font-semibold tabular-nums text-[#05B169]">${s.dailyCashFlow.toFixed(2)}/d</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Ann. Return</p>
                  <p className="font-semibold tabular-nums">{s.annReturn.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Capital req.</p>
                  <p className="font-semibold tabular-nums">${s.capitalRequired.toFixed(0)}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Net premium: ${s.netPremiumDollars.toFixed(2)} · Max loss: ${((s.shortStrike - s.longStrike) * 100 - s.netPremiumDollars).toFixed(0)} · B/E: ${(s.shortStrike - s.netPremium).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">
        Max loss per spread: ${spreadWidth * 100} − net premium collected
      </p>
    </div>
  );
}
