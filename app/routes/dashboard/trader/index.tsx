import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { StockSearchInput } from "~/components/trader/StockSearchInput";
import { RecentTickersList } from "~/components/trader/RecentTickersList";

export function meta() {
  return [{ title: "Search — Premia" }];
}

export default function TraderSearch() {
  const navigate = useNavigate();
  const watchlist = useQuery(api.watchlist.getWatchlist);

  function handleSelect(ticker: string) {
    navigate(`/dashboard/trader/${ticker.toUpperCase()}`);
  }

  return (
    <div className="px-4 pt-10 pb-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Find income trades</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Search any stock to see its best options income
        </p>
      </div>

      {/* Search */}
      <StockSearchInput onSelect={handleSelect} autoFocus />

      {/* Popular tickers quick-picks */}
      <div className="mt-6">
        <p className="text-xs text-gray-400 uppercase font-medium tracking-wide mb-3">Popular</p>
        <div className="flex flex-wrap gap-2">
          {["AAPL", "TSLA", "SPY", "NVDA", "QQQ", "MSFT"].map((t) => (
            <button
              key={t}
              onClick={() => handleSelect(t)}
              className="px-3 py-1.5 rounded-lg border border-[#E5E9F0] dark:border-[#1E2330] text-sm font-medium hover:border-[#0052FF] hover:text-[#0052FF] transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Recently viewed */}
      {watchlist && watchlist.length > 0 && (
        <div className="mt-8">
          <p className="text-xs text-gray-400 uppercase font-medium tracking-wide mb-3">Recently viewed</p>
          <RecentTickersList tickers={watchlist} onSelect={handleSelect} />
        </div>
      )}

      {/* Scanner CTA */}
      <div className="mt-10 rounded-xl bg-[#F5F8FF] dark:bg-[#13171F] border border-[#E5E9F0] dark:border-[#1E2330] p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold">Scan all stocks</p>
          <p className="text-sm text-gray-500 mt-0.5">Find the highest income trades across 80+ stocks</p>
        </div>
        <a
          href="/dashboard/trader/scanner"
          className="bg-[#0052FF] hover:bg-[#0039B3] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          Scan now →
        </a>
      </div>
    </div>
  );
}
