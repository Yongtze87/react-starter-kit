import {
  calcDailyCashFlow,
  calcAnnualizedReturnCC,
  calcAnnualizedReturnCSP,
  calcDTE,
} from "~/lib/optionsCalculations";
import { CostBasisBadge } from "./CostBasisBadge";

interface Props {
  bid: number;
  ask: number;
  mid: number;
  strike: number;
  expiration: string;
  stockPrice: number;
  mode: "cc" | "csp";
  isTop3?: boolean;
  costBasis?: number | null;
  onClick: () => void;
}

export function OptionCell({
  bid, ask, mid, strike, expiration, stockPrice, mode, isTop3, costBasis, onClick,
}: Props) {
  const dte = calcDTE(expiration);

  if (mid < 0.05) {
    return (
      <button className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700 text-sm py-3 px-2" disabled>
        —
      </button>
    );
  }

  const daily = calcDailyCashFlow(mid, dte);
  const annReturn =
    mode === "cc"
      ? calcAnnualizedReturnCC(mid, stockPrice, dte)
      : calcAnnualizedReturnCSP(mid, strike, dte);

  // CC: warning if strike below cost basis
  const belowBasis = mode === "cc" && costBasis != null && strike < costBasis;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-2.5 rounded-lg transition-colors hover:bg-[#F5F8FF] dark:hover:bg-[#1E2330] ${
        isTop3 ? "ring-1 ring-[#05B169]" : ""
      } ${belowBasis ? "bg-red-50/40 dark:bg-red-950/20" : ""}`}
    >
      <p className="text-xs font-semibold tabular-nums text-[#05B169]">
        ${daily.toFixed(2)}/d
      </p>
      <p className="text-[11px] text-gray-500 tabular-nums">
        {annReturn.toFixed(1)}% ann
      </p>
      {mode === "cc" && costBasis != null && (
        <CostBasisBadge strike={strike} costBasis={costBasis} />
      )}
    </button>
  );
}
