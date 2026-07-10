import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import { StockHeader } from "~/components/trader/StockHeader";
import { OptionsGrid } from "~/components/trader/OptionsGrid";
import { SpreadGrid } from "~/components/trader/SpreadGrid";
import { WheelCalculator } from "~/components/trader/WheelCalculator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

export function meta({ params }: { params: { ticker?: string } }) {
  return [{ title: `${params.ticker?.toUpperCase() ?? "Ticker"} — Premia` }];
}

type TabKey = "cc" | "csp" | "wheel" | "spread";

export default function TickerPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const upper = ticker?.toUpperCase() ?? "";
  const [activeTab, setActiveTab] = useState<TabKey>("cc");

  const addToWatchlist = useMutation(api.watchlist.addToWatchlist);

  useEffect(() => {
    if (upper) {
      addToWatchlist({ ticker: upper }).catch(() => {});
    }
  }, [upper]); // eslint-disable-line react-hooks/exhaustive-deps

  const quote = useQuery(api.options.getStockQuote, { ticker: upper });
  const expirations = useQuery(api.options.getExpirationDates, { ticker: upper });

  if (!upper) return <div className="p-4 text-gray-500">Invalid ticker</div>;

  if (!quote && quote !== null) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <div className="h-8 w-32 bg-[#F5F8FF] dark:bg-[#13171F] rounded animate-pulse" />
        <div className="h-28 bg-[#F5F8FF] dark:bg-[#13171F] rounded-xl animate-pulse" />
        <div className="h-64 bg-[#F5F8FF] dark:bg-[#13171F] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (quote === null) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-xl font-bold">{upper}</p>
        <p className="text-gray-500 mt-2">Ticker not found in our universe</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#0052FF] text-sm hover:underline">
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Back button */}
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Stock header */}
      <div className="px-4 mt-3">
        <StockHeader quote={quote} ticker={upper} />
      </div>

      {/* Strategy tabs */}
      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
          <div className="px-4">
            <TabsList className="w-full grid grid-cols-4 h-9">
              <TabsTrigger value="cc" className="text-xs">Covered Call</TabsTrigger>
              <TabsTrigger value="csp" className="text-xs">Cash-Secured Put</TabsTrigger>
              <TabsTrigger value="wheel" className="text-xs">Wheel</TabsTrigger>
              <TabsTrigger value="spread" className="text-xs">Put Spread</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="cc" className="mt-3">
            <OptionsGrid
              ticker={upper}
              stockPrice={quote.price}
              expirations={expirations ?? []}
              mode="cc"
            />
          </TabsContent>

          <TabsContent value="csp" className="mt-3">
            <OptionsGrid
              ticker={upper}
              stockPrice={quote.price}
              expirations={expirations ?? []}
              mode="csp"
            />
          </TabsContent>

          <TabsContent value="wheel" className="mt-3">
            <div className="px-4">
              <WheelCalculator
                ticker={upper}
                stockPrice={quote.price}
                expirations={expirations ?? []}
              />
            </div>
          </TabsContent>

          <TabsContent value="spread" className="mt-3">
            <div className="px-4">
              <SpreadGrid
                ticker={upper}
                stockPrice={quote.price}
                expirations={expirations ?? []}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
