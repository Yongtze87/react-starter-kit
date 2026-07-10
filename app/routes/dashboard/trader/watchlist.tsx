import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router";
import { api } from "../../../../convex/_generated/api";
import { X } from "lucide-react";

export function meta() {
  return [{ title: "Watchlist — Premia" }];
}

export default function Watchlist() {
  const navigate = useNavigate();
  const watchlist = useQuery(api.watchlist.getWatchlist);
  const remove = useMutation(api.watchlist.removeFromWatchlist);
  const stockQueries = (watchlist ?? []).map((w) => w.ticker);

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Watchlist</h1>
        <p className="text-xs text-gray-500 mt-0.5">Recently viewed tickers</p>
      </div>

      {watchlist === undefined && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[#F5F8FF] dark:bg-[#13171F] animate-pulse" />
          ))}
        </div>
      )}

      {watchlist && watchlist.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No tickers yet</p>
          <p className="text-sm mt-1">Search for a stock to add it here</p>
          <button
            onClick={() => navigate("/dashboard/trader")}
            className="mt-4 text-[#0052FF] text-sm font-medium hover:underline"
          >
            Search now →
          </button>
        </div>
      )}

      {watchlist && watchlist.length > 0 && (
        <div className="space-y-2">
          {watchlist.map((entry) => (
            <div
              key={entry._id}
              className="flex items-center justify-between p-4 rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] cursor-pointer hover:border-[#0052FF] transition-colors"
              onClick={() => navigate(`/dashboard/trader/${entry.ticker}`)}
            >
              <div>
                <span className="font-semibold">{entry.ticker}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {new Date(entry.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove({ ticker: entry.ticker });
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                aria-label={`Remove ${entry.ticker}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Phase 2 preview */}
      <div className="mt-8 p-4 rounded-xl border border-dashed border-[#E5E9F0] dark:border-[#1E2330] text-center">
        <p className="text-sm font-medium text-gray-500">Anomaly detection coming in Phase 2</p>
        <p className="text-xs text-gray-400 mt-1">Pin up to 20 tickers and get alerts when term structure inversions appear</p>
      </div>
    </div>
  );
}
