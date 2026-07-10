import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Search } from "lucide-react";

interface Props {
  onSelect: (ticker: string) => void;
  autoFocus?: boolean;
}

export function StockSearchInput({ onSelect, autoFocus }: Props) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useQuery(
    api.options.searchTickers,
    input.length >= 1 ? { query: input } : "skip"
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(ticker: string) {
    setInput("");
    setOpen(false);
    onSelect(ticker);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && input.trim()) {
      handleSelect(input.trim().toUpperCase());
    }
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          autoFocus={autoFocus}
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search ticker… AAPL, TSLA, SPY"
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] text-base outline-none focus:ring-2 focus:ring-[#0052FF] placeholder:text-gray-400"
        />
      </div>

      {open && results && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] shadow-lg overflow-hidden">
          {results.map((r) => (
            <li key={r.ticker}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(r.ticker)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F5F8FF] dark:hover:bg-[#1E2330] transition-colors text-left"
              >
                <span className="font-semibold">{r.ticker}</span>
                <span className="text-sm text-gray-500 truncate max-w-[60%] text-right">{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
