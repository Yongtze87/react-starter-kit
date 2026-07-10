import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface Props {
  tickers: Array<{ ticker: string; addedAt: number; _id: string }>;
  onSelect: (ticker: string) => void;
}

export function RecentTickersList({ tickers, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tickers.slice(0, 8).map((entry) => (
        <button
          key={entry._id}
          onClick={() => onSelect(entry.ticker)}
          className="px-3 py-2 rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] text-sm font-semibold hover:border-[#0052FF] hover:text-[#0052FF] transition-colors"
        >
          {entry.ticker}
        </button>
      ))}
    </div>
  );
}
