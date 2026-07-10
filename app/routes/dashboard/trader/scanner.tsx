import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ScannerFilters } from "~/components/trader/ScannerFilters";
import { ScannerResultsTable } from "~/components/trader/ScannerResultsTable";
import { useState } from "react";

export function meta() {
  return [{ title: "Income Scanner — Premia" }];
}

export interface ScanFilters {
  strategies: ("CC" | "CSP" | "BullPutSpread")[];
  minDTE: number;
  maxDTE: number;
  minAnnReturn: number;
  myCapital: number | null;
  hideOverBudget: boolean;
  riskLevels: ("Conservative" | "Moderate" | "Aggressive")[];
}

const DEFAULT_FILTERS: ScanFilters = {
  strategies: ["CC", "CSP", "BullPutSpread"],
  minDTE: 7,
  maxDTE: 90,
  minAnnReturn: 0,
  myCapital: null,
  hideOverBudget: false,
  riskLevels: ["Conservative", "Moderate", "Aggressive"],
};

export default function Scanner() {
  const [filters, setFilters] = useState<ScanFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const results = useQuery(api.scanner.scanAllStocks, {
    strategies: filters.strategies,
    minDTE: filters.minDTE,
    maxDTE: filters.maxDTE,
    minAnnReturn: filters.minAnnReturn,
  });

  // Apply client-side capital + risk filters
  const filtered = (results ?? []).filter((r) => {
    if (!filters.riskLevels.includes(r.riskCategory)) return false;
    if (filters.myCapital && filters.hideOverBudget && r.capitalRequired > filters.myCapital) return false;
    return true;
  });

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Income Scanner</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {results === undefined ? "Scanning…" : `${filtered.length} trades found`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#0052FF] border border-[#0052FF] px-3 py-1.5 rounded-lg hover:bg-[#F5F8FF] dark:hover:bg-[#13171F] transition-colors"
        >
          Filters {filters.myCapital || filters.minAnnReturn > 0 ? "●" : "▼"}
        </button>
      </div>

      {/* Results */}
      <ScannerResultsTable
        results={filtered}
        loading={results === undefined}
        myCapital={filters.myCapital}
        hideOverBudget={filters.hideOverBudget}
      />

      {/* Filter sheet */}
      {showFilters && (
        <ScannerFilters
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
