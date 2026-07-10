import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  weekHigh52: number;
  weekLow52: number;
}

interface Props {
  quote: StockQuote;
  ticker: string;
}

export function StockHeader({ quote, ticker }: Props) {
  const settings = useQuery(api.stockSettings.getStockSettings, { ticker });
  const setSettings = useMutation(api.stockSettings.setStockSettings);

  const [sharesInput, setSharesInput] = useState("");
  const [costBasisInput, setCostBasisInput] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (settings) {
      setSharesInput(settings.sharesOwned?.toString() ?? "");
      setCostBasisInput(settings.costBasis?.toString() ?? "");
    }
  }, [settings]);

  function handleBlur() {
    const shares = parseFloat(sharesInput);
    const basis = parseFloat(costBasisInput);
    setSettings({
      ticker,
      sharesOwned: isNaN(shares) ? undefined : shares,
      costBasis: isNaN(basis) ? undefined : basis,
    }).catch(() => {});
    setEditing(false);
  }

  // 52-week range bar
  const range = quote.weekHigh52 - quote.weekLow52;
  const position = range > 0 ? ((quote.price - quote.weekLow52) / range) * 100 : 50;
  const clampedPos = Math.max(0, Math.min(100, position));

  const sharesOwned = parseFloat(sharesInput);
  const stockValue = !isNaN(sharesOwned) ? sharesOwned * quote.price : null;

  return (
    <div className="rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] p-4">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums">${quote.price.toFixed(2)}</span>
            <span className="text-sm text-gray-500 font-medium">{quote.ticker}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{quote.name}</p>
        </div>
        {stockValue && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Position value</p>
            <p className="text-sm font-semibold tabular-nums">${stockValue.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* 52-week range */}
      <div className="mt-3">
        <div className="relative h-1.5 rounded-full bg-[#E5E9F0] dark:bg-[#1E2330]">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0052FF] border-2 border-white dark:border-[#0A0B0D] shadow"
            style={{ left: `calc(${clampedPos}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400 tabular-nums">${quote.weekLow52.toFixed(2)}</span>
          <span className="text-[10px] text-gray-400">52-week range</span>
          <span className="text-[10px] text-gray-400 tabular-nums">${quote.weekHigh52.toFixed(2)}</span>
        </div>
      </div>

      {/* Optional: shares + cost basis */}
      <div className="mt-3 flex gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-gray-400 uppercase tracking-wide">Shares owned</label>
          <input
            type="number"
            value={sharesInput}
            onChange={(e) => { setSharesInput(e.target.value); setEditing(true); }}
            onBlur={handleBlur}
            placeholder="0"
            className="w-full mt-0.5 border border-[#E5E9F0] dark:border-[#1E2330] bg-transparent rounded-lg px-2 py-1.5 text-sm tabular-nums outline-none focus:ring-1 focus:ring-[#0052FF] placeholder:text-gray-300"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-gray-400 uppercase tracking-wide">Cost basis / share</label>
          <input
            type="number"
            value={costBasisInput}
            onChange={(e) => { setCostBasisInput(e.target.value); setEditing(true); }}
            onBlur={handleBlur}
            placeholder="$0.00"
            className="w-full mt-0.5 border border-[#E5E9F0] dark:border-[#1E2330] bg-transparent rounded-lg px-2 py-1.5 text-sm tabular-nums outline-none focus:ring-1 focus:ring-[#0052FF] placeholder:text-gray-300"
          />
        </div>
      </div>
    </div>
  );
}
