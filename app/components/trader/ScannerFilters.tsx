import { X } from "lucide-react";
import type { ScanFilters } from "~/routes/dashboard/trader/scanner";

interface Props {
  filters: ScanFilters;
  onChange: (f: ScanFilters) => void;
  onClose: () => void;
}

const STRATEGIES = [
  { key: "CC" as const, label: "Covered Calls" },
  { key: "CSP" as const, label: "Cash-Secured Puts" },
  { key: "BullPutSpread" as const, label: "Bull Put Spreads" },
];

const RISK_LEVELS = [
  { key: "Conservative" as const, label: "Conservative (10%+ OTM)" },
  { key: "Moderate" as const, label: "Moderate (5–10% OTM)" },
  { key: "Aggressive" as const, label: "Aggressive (<5% OTM)" },
];

export function ScannerFilters({ filters, onChange, onClose }: Props) {
  function toggleStrategy(key: typeof STRATEGIES[number]["key"]) {
    const has = filters.strategies.includes(key);
    const next = has
      ? filters.strategies.filter((s) => s !== key)
      : [...filters.strategies, key];
    if (next.length === 0) return; // keep at least one
    onChange({ ...filters, strategies: next });
  }

  function toggleRisk(key: typeof RISK_LEVELS[number]["key"]) {
    const has = filters.riskLevels.includes(key);
    const next = has
      ? filters.riskLevels.filter((r) => r !== key)
      : [...filters.riskLevels, key];
    if (next.length === 0) return;
    onChange({ ...filters, riskLevels: next });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0A0B0D] rounded-t-2xl max-h-[80vh] flex flex-col max-w-[760px] mx-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#E5E9F0] dark:bg-[#1E2330]" />
        </div>

        <div className="flex items-center justify-between px-5 pb-3 border-b border-[#E5E9F0] dark:border-[#1E2330] shrink-0">
          <h2 className="font-bold">Filters</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F5F8FF] dark:hover:bg-[#1E2330]">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
          {/* Strategy */}
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Strategy</h3>
            <div className="space-y-2">
              {STRATEGIES.map((s) => (
                <label key={s.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.strategies.includes(s.key)}
                    onChange={() => toggleStrategy(s.key)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0052FF] accent-[#0052FF]"
                  />
                  <span className="text-sm">{s.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Capital */}
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">My capital</h3>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={filters.myCapital ?? ""}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  onChange({ ...filters, myCapital: isNaN(v) ? null : v });
                }}
                placeholder="Any amount"
                className="w-full pl-7 pr-3 py-2.5 border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0052FF] placeholder:text-gray-400"
              />
            </div>
            {filters.myCapital && (
              <label className="flex items-center gap-3 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hideOverBudget}
                  onChange={(e) => onChange({ ...filters, hideOverBudget: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#0052FF] accent-[#0052FF]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Hide trades over budget</span>
              </label>
            )}
          </section>

          {/* DTE range */}
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Days to expiry</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={filters.minDTE}
                onChange={(e) => onChange({ ...filters, minDTE: parseInt(e.target.value) || 0 })}
                className="w-20 border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] rounded-lg px-2 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-[#0052FF]"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                value={filters.maxDTE}
                onChange={(e) => onChange({ ...filters, maxDTE: parseInt(e.target.value) || 90 })}
                className="w-20 border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] rounded-lg px-2 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-[#0052FF]"
              />
              <span className="text-sm text-gray-400">days</span>
            </div>
          </section>

          {/* Min return */}
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Minimum annualized return</h3>
            <div className="relative">
              <input
                type="number"
                value={filters.minAnnReturn || ""}
                onChange={(e) => onChange({ ...filters, minAnnReturn: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full pr-7 pl-3 py-2.5 border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0052FF] placeholder:text-gray-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </section>

          {/* Risk levels */}
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Risk level</h3>
            <div className="space-y-2">
              {RISK_LEVELS.map((r) => (
                <label key={r.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.riskLevels.includes(r.key)}
                    onChange={() => toggleRisk(r.key)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0052FF] accent-[#0052FF]"
                  />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-[#E5E9F0] dark:border-[#1E2330]">
          <button
            onClick={onClose}
            className="w-full bg-[#0052FF] hover:bg-[#0039B3] text-white font-medium py-3 rounded-xl transition-colors"
          >
            Apply filters
          </button>
        </div>
      </div>
    </>
  );
}
