import { useState } from "react";
import { useNavigate } from "react-router";
import { RiskBadge } from "./RiskBadge";
import type { ScanResult } from "~/routes/dashboard/trader/scanner";

interface Props {
  results: ScanResult[];
  loading: boolean;
  myCapital: number | null;
  hideOverBudget: boolean;
}

const PAGE_SIZE = 20;

const STRATEGY_LABELS: Record<string, string> = {
  CC: "Covered Call",
  CSP: "Cash-Secured Put",
  BullPutSpread: "Put Spread",
};

type SortKey = "annReturn" | "dailyCashFlow" | "capitalRequired";

export function ScannerResultsTable({ results, loading, myCapital, hideOverBudget }: Props) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("annReturn");
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
    setPage(1);
  }

  const sorted = [...results].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function SortHeader({ col, label }: { col: SortKey; label: string }) {
    const active = sortKey === col;
    return (
      <button
        onClick={() => handleSort(col)}
        className={`flex items-center gap-0.5 text-[10px] uppercase tracking-wide font-medium whitespace-nowrap ${active ? "text-[#0052FF]" : "text-gray-400"}`}
      >
        {label}
        {active && <span className="text-[10px]">{sortAsc ? " ↑" : " ↓"}</span>}
      </button>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2 mt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-[#F5F8FF] dark:bg-[#13171F] animate-pulse" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-3xl mb-2">🔍</p>
        <p className="font-medium">No trades found</p>
        <p className="text-sm mt-1">Try relaxing your filters</p>
      </div>
    );
  }

  return (
    <div>
      {/* Column headers for wider screens */}
      <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-2 px-3 pb-1 mt-2">
        <span className="text-[10px] uppercase tracking-wide font-medium text-gray-400">Ticker</span>
        <span className="text-[10px] uppercase tracking-wide font-medium text-gray-400">Strategy</span>
        <SortHeader col="dailyCashFlow" label="$/Day" />
        <SortHeader col="annReturn" label="Ann %" />
        <SortHeader col="capitalRequired" label="Capital" />
        <span className="text-[10px] uppercase tracking-wide font-medium text-gray-400">Risk</span>
      </div>

      {/* Mobile sort controls */}
      <div className="flex gap-2 mb-3 sm:hidden overflow-x-auto">
        {(["annReturn", "dailyCashFlow", "capitalRequired"] as SortKey[]).map((k) => (
          <button
            key={k}
            onClick={() => handleSort(k)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              sortKey === k ? "bg-[#0052FF] text-white" : "border border-[#E5E9F0] dark:border-[#1E2330]"
            }`}
          >
            {k === "annReturn" ? "Ann %" : k === "dailyCashFlow" ? "$/Day" : "Capital"}
            {sortKey === k && (sortAsc ? " ↑" : " ↓")}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {paged.map((r, i) => {
          const overBudget = myCapital ? r.capitalRequired > myCapital : false;
          const expLabel = new Date(r.expiration + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

          return (
            <button
              key={`${r.ticker}-${r.strategy}-${r.expiration}-${r.strike}-${i}`}
              onClick={() => navigate(`/dashboard/trader/${r.ticker}`, {
                state: { preselectedStrike: r.strike, preselectedExpiry: r.expiration },
              })}
              className={`w-full text-left rounded-xl border p-3.5 transition-colors hover:border-[#0052FF] ${
                overBudget
                  ? "border-[#E5E9F0] dark:border-[#1E2330] opacity-50"
                  : "border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F]"
              }`}
            >
              {/* Mobile layout */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold">{r.ticker}</span>
                    <span className="text-xs text-gray-500 ml-2">{STRATEGY_LABELS[r.strategy]}</span>
                  </div>
                  <RiskBadge risk={r.riskCategory} />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  ${r.strike} · {expLabel} · {r.dte}d
                </div>
                <div className="mt-2 flex gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400">$/Day</p>
                    <p className="font-semibold text-sm tabular-nums text-[#05B169]">${r.dailyCashFlow.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Ann %</p>
                    <p className="font-semibold text-sm tabular-nums">{r.annReturn.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Capital</p>
                    <p className={`font-semibold text-sm tabular-nums ${overBudget ? "text-[#DF5F67]" : ""}`}>
                      ${r.capitalRequired.toLocaleString()}
                      {overBudget && <span className="text-[9px] ml-1">over</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-2 items-center">
                <div>
                  <span className="font-bold">{r.ticker}</span>
                  <span className="text-xs text-gray-400 block">${r.strike} · {expLabel} · {r.dte}d</span>
                </div>
                <span className="text-sm">{STRATEGY_LABELS[r.strategy]}</span>
                <span className="text-sm font-semibold tabular-nums text-[#05B169]">${r.dailyCashFlow.toFixed(2)}</span>
                <span className="text-sm font-semibold tabular-nums">{r.annReturn.toFixed(1)}%</span>
                <span className={`text-sm font-semibold tabular-nums ${overBudget ? "text-[#DF5F67]" : ""}`}>
                  ${r.capitalRequired.toLocaleString()}
                </span>
                <RiskBadge risk={r.riskCategory} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-[#E5E9F0] dark:border-[#1E2330] text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            {page} / {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="px-3 py-1.5 rounded-lg border border-[#E5E9F0] dark:border-[#1E2330] text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-3">
        Capital required: strike × 100 (CC/CSP) · spread width × 100 (Put Spread)
      </p>
    </div>
  );
}
