import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { OptionCell } from "./OptionCell";
import { TradeDetailDrawer, type TradeDetailProps } from "./TradeDetailDrawer";
import { UnderwaterPanel } from "./UnderwaterPanel";
import {
  calcAnnualizedReturnCC,
  calcAnnualizedReturnCSP,
  calcDTE,
} from "~/lib/optionsCalculations";

interface Props {
  ticker: string;
  stockPrice: number;
  expirations: string[];
  mode: "cc" | "csp";
}

export function OptionsGrid({ ticker, stockPrice, expirations, mode }: Props) {
  const [selectedExpiry, setSelectedExpiry] = useState<string | null>(null);
  const [activeTrade, setActiveTrade] = useState<TradeDetailProps | null>(null);
  const settings = useQuery(api.stockSettings.getStockSettings, { ticker });

  const sharesOwned = settings?.sharesOwned;
  const costBasis = settings?.costBasis;

  // Show top 3 expirations initially, load more on request
  const [showAll, setShowAll] = useState(false);
  const visibleExpirations = showAll ? expirations : expirations.slice(0, 3);

  if (expirations.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-400">
        <div className="h-4 w-32 bg-[#F5F8FF] dark:bg-[#13171F] rounded animate-pulse mx-auto" />
      </div>
    );
  }

  const showUnderwater = mode === "cc" && costBasis && sharesOwned && stockPrice < costBasis;

  return (
    <div className="px-4">
      {showUnderwater && costBasis && sharesOwned && (
        <UnderwaterPanel stockPrice={stockPrice} costBasis={costBasis} sharesOwned={sharesOwned} />
      )}

      <div className="space-y-3">
        {visibleExpirations.map((exp, i) => (
          <ExpiryRow
            key={exp}
            expiration={exp}
            ticker={ticker}
            stockPrice={stockPrice}
            mode={mode}
            costBasis={costBasis}
            isBest={i === 0}
            onCellClick={setActiveTrade}
          />
        ))}
      </div>

      {!showAll && expirations.length > 3 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-3 py-2.5 text-sm text-[#0052FF] font-medium hover:underline"
        >
          Show {expirations.length - 3} more expiry dates ↓
        </button>
      )}

      <TradeDetailDrawer
        trade={activeTrade}
        onClose={() => setActiveTrade(null)}
      />
    </div>
  );
}

interface ExpiryRowProps {
  expiration: string;
  ticker: string;
  stockPrice: number;
  mode: "cc" | "csp";
  costBasis?: number | null;
  isBest: boolean;
  onCellClick: (trade: TradeDetailProps) => void;
}

function ExpiryRow({ expiration, ticker, stockPrice, mode, costBasis, isBest, onCellClick }: ExpiryRowProps) {
  const chain = useQuery(api.options.getOptionsChain, { ticker, expiration });

  const dte = calcDTE(expiration);
  const expLabel = new Date(expiration + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const contracts = (chain ?? []).filter((c) => c.optionType === (mode === "cc" ? "call" : "put"));

  // Pick strikes near ATM (±20% of price)
  const atmStrikes = contracts
    .filter((c) => {
      const dist = Math.abs(c.strike - stockPrice) / stockPrice;
      return dist <= 0.20;
    })
    .sort((a, b) => a.strike - b.strike);

  // Compute ann returns to find top 3
  const withReturns = atmStrikes.map((c) => ({
    ...c,
    annReturn:
      mode === "cc"
        ? calcAnnualizedReturnCC(c.mid, stockPrice, dte)
        : calcAnnualizedReturnCSP(c.mid, c.strike, dte),
  }));
  const sorted = [...withReturns].sort((a, b) => b.annReturn - a.annReturn);
  const top3Strikes = new Set(sorted.slice(0, 3).map((c) => c.strike));

  // Show 5 strikes near ATM
  const displayStrikes = atmStrikes.slice(
    Math.max(0, Math.floor(atmStrikes.length / 2) - 2),
    Math.max(0, Math.floor(atmStrikes.length / 2) - 2) + 5
  );

  if (!chain) {
    return (
      <div className="rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] p-3 animate-pulse">
        <div className="h-4 w-24 bg-[#F5F8FF] dark:bg-[#13171F] rounded mb-2" />
        <div className="grid grid-cols-5 gap-1">
          {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-[#F5F8FF] dark:bg-[#13171F] rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${isBest ? "border-[#0052FF]" : "border-[#E5E9F0] dark:border-[#1E2330]"} overflow-hidden`}>
      {/* Expiry header */}
      <div className={`flex items-center gap-2 px-3 py-2 ${isBest ? "bg-[#0052FF]/5" : "bg-[#F5F8FF] dark:bg-[#13171F]"}`}>
        {isBest && <span className="text-sm">🏆</span>}
        <span className="text-xs font-semibold">{expLabel}</span>
        <span className="text-[10px] text-gray-400">{dte}d left</span>
      </div>

      {/* Strike columns */}
      <div className="overflow-x-auto">
        <div className="grid min-w-0" style={{ gridTemplateColumns: `repeat(${displayStrikes.length}, minmax(0, 1fr))` }}>
          {/* Strike headers */}
          {displayStrikes.map((c) => {
            const isATM = Math.abs(c.strike - stockPrice) / stockPrice < 0.01;
            return (
              <div
                key={c.strike}
                className={`text-center text-[10px] py-1.5 border-b border-[#E5E9F0] dark:border-[#1E2330] font-medium tabular-nums ${
                  isATM ? "bg-[#E5E9F0]/60 dark:bg-[#1E2330]/60" : ""
                }`}
              >
                ${c.strike}
                {isATM && <span className="text-[8px] text-gray-400 block">ATM</span>}
              </div>
            );
          })}

          {/* Cells */}
          {displayStrikes.map((c) => (
            <div key={c.strike} className="border-r border-[#E5E9F0] dark:border-[#1E2330] last:border-r-0">
              <OptionCell
                bid={c.bid}
                ask={c.ask}
                mid={c.mid}
                strike={c.strike}
                expiration={expiration}
                stockPrice={stockPrice}
                mode={mode}
                isTop3={top3Strikes.has(c.strike)}
                costBasis={costBasis}
                onClick={() =>
                  onCellClick({
                    ticker,
                    stockPrice,
                    strike: c.strike,
                    expiration,
                    bid: c.bid,
                    ask: c.ask,
                    mode,
                    sharesOwned: undefined,
                    costBasis: costBasis ?? undefined,
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
