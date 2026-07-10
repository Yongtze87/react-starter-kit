import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { calcDTE, calcWheelCycle } from "~/lib/optionsCalculations";

interface Props {
  ticker: string;
  stockPrice: number;
  expirations: string[];
}

export function WheelCalculator({ ticker, stockPrice, expirations }: Props) {
  const [cspExpiry, setCspExpiry] = useState(expirations[0] ?? "");
  const [ccExpiry, setCcExpiry] = useState(expirations[1] ?? expirations[0] ?? "");

  const cspChain = useQuery(api.options.getOptionsChain, cspExpiry ? { ticker, expiration: cspExpiry } : "skip");
  const ccChain = useQuery(api.options.getOptionsChain, ccExpiry ? { ticker, expiration: ccExpiry } : "skip");

  const cspPuts = (cspChain ?? []).filter((c) => c.optionType === "put");
  const ccCalls = (ccChain ?? []).filter((c) => c.optionType === "call");

  // Default: 5% OTM put for CSP, 5% OTM call for CC
  const defaultCspStrike = cspPuts
    .filter((p) => p.strike <= stockPrice)
    .sort((a, b) => Math.abs(stockPrice * 0.95 - a.strike) - Math.abs(stockPrice * 0.95 - b.strike))[0]?.strike ?? null;

  const defaultCcStrike = ccCalls
    .filter((c) => c.strike >= stockPrice)
    .sort((a, b) => Math.abs(stockPrice * 1.05 - a.strike) - Math.abs(stockPrice * 1.05 - b.strike))[0]?.strike ?? null;

  const [cspStrikeInput, setCspStrikeInput] = useState<number | null>(null);
  const [ccStrikeInput, setCcStrikeInput] = useState<number | null>(null);

  const cspStrike = cspStrikeInput ?? defaultCspStrike;
  const ccStrike = ccStrikeInput ?? defaultCcStrike;

  const cspContract = cspPuts.find((p) => p.strike === cspStrike);
  const ccContract = ccCalls.find((c) => c.strike === ccStrike);

  const cspDTE = cspExpiry ? calcDTE(cspExpiry) : 0;
  const ccDTE = ccExpiry ? calcDTE(ccExpiry) : 0;
  const totalDTE = cspDTE + ccDTE;

  const cycle = useMemo(() => {
    if (!cspContract || !ccContract || totalDTE === 0) return null;
    return calcWheelCycle(cspStrike!, cspContract.mid, ccStrike!, ccContract.mid, totalDTE);
  }, [cspContract, ccContract, cspStrike, ccStrike, totalDTE]);

  function expiryLabel(exp: string) {
    return new Date(exp + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const strikeOptions = (contracts: typeof cspPuts) =>
    contracts.map((c) => c.strike).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => b - a);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {/* CSP Phase */}
        <div className="rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] p-4 bg-white dark:bg-[#13171F]">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Phase 1 — Sell Put</p>
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wide">Expiry</label>
              <select
                value={cspExpiry}
                onChange={(e) => setCspExpiry(e.target.value)}
                className="block w-full mt-0.5 border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#0A0B0D] rounded-lg px-2 py-1.5 text-xs outline-none"
              >
                {expirations.map((e) => (
                  <option key={e} value={e}>{expiryLabel(e)} ({calcDTE(e)}d)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wide">Strike (put)</label>
              <select
                value={cspStrike ?? ""}
                onChange={(e) => setCspStrikeInput(parseFloat(e.target.value))}
                className="block w-full mt-0.5 border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#0A0B0D] rounded-lg px-2 py-1.5 text-xs outline-none"
              >
                {strikeOptions(cspPuts.filter(p => p.strike <= stockPrice)).map((s) => (
                  <option key={s} value={s}>${s}</option>
                ))}
              </select>
            </div>
            {cspContract && (
              <div className="pt-1 space-y-1 text-xs">
                <p className="text-gray-500">Premium: <span className="font-semibold tabular-nums text-[#05B169]">${(cspContract.mid * 100).toFixed(2)}</span></p>
                <p className="text-gray-500">Daily: <span className="font-semibold tabular-nums">${(cspContract.mid * 100 / cspDTE).toFixed(2)}/d</span></p>
                <p className="text-gray-500">Net cost if assigned: <span className="font-semibold tabular-nums">${(cspStrike! - cspContract.mid).toFixed(2)}/sh</span></p>
              </div>
            )}
          </div>
        </div>

        {/* CC Phase */}
        <div className="rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] p-4 bg-white dark:bg-[#13171F]">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Phase 2 — Sell Call</p>
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wide">Expiry</label>
              <select
                value={ccExpiry}
                onChange={(e) => setCcExpiry(e.target.value)}
                className="block w-full mt-0.5 border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#0A0B0D] rounded-lg px-2 py-1.5 text-xs outline-none"
              >
                {expirations.map((e) => (
                  <option key={e} value={e}>{expiryLabel(e)} ({calcDTE(e)}d)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wide">Strike (call)</label>
              <select
                value={ccStrike ?? ""}
                onChange={(e) => setCcStrikeInput(parseFloat(e.target.value))}
                className="block w-full mt-0.5 border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#0A0B0D] rounded-lg px-2 py-1.5 text-xs outline-none"
              >
                {strikeOptions(ccCalls.filter(c => c.strike >= stockPrice)).map((s) => (
                  <option key={s} value={s}>${s}</option>
                ))}
              </select>
            </div>
            {ccContract && (
              <div className="pt-1 space-y-1 text-xs">
                <p className="text-gray-500">Premium: <span className="font-semibold tabular-nums text-[#05B169]">${(ccContract.mid * 100).toFixed(2)}</span></p>
                <p className="text-gray-500">Daily: <span className="font-semibold tabular-nums">${(ccContract.mid * 100 / ccDTE).toFixed(2)}/d</span></p>
                <p className="text-gray-500">Effective exit: <span className="font-semibold tabular-nums">${(ccStrike! + ccContract.mid).toFixed(2)}/sh</span></p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cycle summary */}
      {cycle && (
        <div className="mt-4 rounded-xl border border-[#0052FF] bg-[#F5F8FF] dark:bg-[#13171F] p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Full cycle summary</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Net cost basis</p>
              <p className="font-semibold tabular-nums">${cycle.netCostBasis.toFixed(2)}/sh</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Effective exit</p>
              <p className="font-semibold tabular-nums">${cycle.effectiveExitPrice.toFixed(2)}/sh</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Cycle profit</p>
              <p className="font-semibold tabular-nums text-[#05B169]">${cycle.totalCycleProfit.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Total premium</p>
              <p className="font-semibold tabular-nums text-[#05B169]">${cycle.totalPremium.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E5E9F0] dark:border-[#1E2330] flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total DTE: {totalDTE} days ({cspDTE} + {ccDTE})</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cycle annualized return</p>
              <p className="text-2xl font-bold tabular-nums text-[#0052FF]">{cycle.cycleAnnualizedReturn.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {!cycle && cspContract && ccContract && (
        <div className="mt-4 text-center text-sm text-gray-400 py-4">
          Select strikes above to see the cycle summary
        </div>
      )}
    </div>
  );
}
