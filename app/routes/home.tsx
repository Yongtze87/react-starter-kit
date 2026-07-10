import { getAuth } from "@clerk/react-router/ssr.server";
import { Link, redirect, useNavigate } from "react-router";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "Premia — Your stocks, working harder" },
    { name: "description", content: "Generate income from your stock positions. No Greeks. No jargon. Just the trade." },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  if (userId) throw redirect("/dashboard/trader");
  return {};
}

function NavBar() {
  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-[#0A0B0D]/90 backdrop-blur border-b border-[#E5E9F0] dark:border-[#1E2330]">
      <div className="max-w-[760px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-[#0052FF]">Premia</Link>
        <div className="flex items-center gap-4">
          <Link to="/pricing" className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hidden sm:block">Pricing</Link>
          <Link to="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">Sign in</Link>
          <Link
            to="/sign-up"
            className="bg-[#0052FF] hover:bg-[#0039B3] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function SearchPreview({ ticker }: { ticker: string }) {
  const quote = useQuery(api.options.getStockQuote, { ticker });
  const expirations = useQuery(api.options.getExpirationDates, { ticker });
  const firstExpiry = expirations?.[1] ?? expirations?.[0];
  const chain = useQuery(
    api.options.getOptionsChain,
    firstExpiry ? { ticker, expiration: firstExpiry } : "skip"
  );

  if (!quote) {
    return (
      <div className="mt-6 rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] p-4 bg-[#F5F8FF] dark:bg-[#13171F] animate-pulse h-28" />
    );
  }

  // Find best CC (highest ann return, OTM call)
  const calls = (chain ?? []).filter((c) => c.optionType === "call" && c.strike > quote.price);
  let bestCC = calls.reduce<(typeof calls)[0] | null>((best, c) => {
    if (c.mid < 0.05) return best;
    const dte = firstExpiry
      ? Math.max(1, Math.ceil((new Date(firstExpiry + "T00:00:00").getTime() - Date.now()) / 86400000))
      : 21;
    const ann = ((c.mid * 100) / (quote.price * 100)) * (365 / dte) * 100;
    const bestAnn = best
      ? ((best.mid * 100) / (quote.price * 100)) * (365 / dte) * 100
      : -1;
    return ann > bestAnn ? c : best;
  }, null);

  if (!bestCC || !firstExpiry) return null;

  const dte = Math.max(1, Math.ceil((new Date(firstExpiry + "T00:00:00").getTime() - Date.now()) / 86400000));
  const ann = ((bestCC.mid * 100) / (quote.price * 100)) * (365 / dte) * 100;
  const daily = (bestCC.mid * 100) / dte;
  const expLabel = new Date(firstExpiry + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="mt-6 rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E9F0] dark:border-[#1E2330] flex items-center justify-between">
        <div>
          <span className="font-bold text-lg">{quote.ticker}</span>
          <span className="text-gray-500 ml-2 text-sm">{quote.name}</span>
        </div>
        <span className="font-semibold tabular-nums">${quote.price.toFixed(2)}</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Best income trade today</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Covered Call · ${bestCC.strike} · {expLabel}</p>
            <p className="text-sm text-gray-500 tabular-nums">
              <span className="text-[#05B169] font-medium">{ann.toFixed(1)}% ann</span>
              {" · "}
              <span className="text-[#05B169] font-medium">${daily.toFixed(2)}/day</span>
            </p>
          </div>
          <Link
            to="/sign-up"
            className="bg-[#0052FF] hover:bg-[#0039B3] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            See all trades →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [searchedTicker, setSearchedTicker] = useState("");
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const t = searchInput.trim().toUpperCase();
    if (t) setSearchedTicker(t);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B0D] text-[#050F19] dark:text-white">
      <NavBar />

      {/* Hero */}
      <main className="max-w-[760px] mx-auto px-4 pt-16 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Generate income<br />from your stocks
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            No Greeks. No jargon. Just the trade.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
            placeholder="Enter a ticker… AAPL, TSLA, SPY"
            className="flex-1 border border-[#E5E9F0] dark:border-[#1E2330] bg-white dark:bg-[#13171F] rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#0052FF] placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="bg-[#0052FF] hover:bg-[#0039B3] text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="text-center mt-3 text-sm text-gray-400">
          or{" "}
          <Link to="/sign-up" className="text-[#0052FF] hover:underline font-medium">
            scan 80+ stocks for today's best income trades →
          </Link>
        </div>

        {searchedTicker && <SearchPreview ticker={searchedTicker} />}

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Search any stock you own",
                desc: "Enter a ticker and Premia finds the highest-income options trades available on that stock today.",
              },
              {
                step: "2",
                title: "See income in plain English",
                desc: "Every trade shown as dollars per day and annualized return — not confusing Greeks or probability math.",
              },
              {
                step: "3",
                title: "Pick the trade that fits your risk",
                desc: "Conservative, moderate, or aggressive — filter by how far out-of-the-money you want to go.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-5 rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] bg-[#F5F8FF] dark:bg-[#13171F]">
                <div className="w-8 h-8 rounded-full bg-[#0052FF] text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/sign-up"
            className="inline-block bg-[#0052FF] hover:bg-[#0039B3] text-white font-semibold text-lg px-8 py-4 rounded-xl transition-colors"
          >
            Start for free →
          </Link>
          <p className="text-sm text-gray-400 mt-3">No credit card required</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E9F0] dark:border-[#1E2330] py-8">
        <div className="max-w-[760px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>© 2026 Premia. Not financial advice.</span>
          <div className="flex gap-4">
            <Link to="/pricing" className="hover:text-gray-600 dark:hover:text-gray-200">Pricing</Link>
            <Link to="/sign-in" className="hover:text-gray-600 dark:hover:text-gray-200">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
