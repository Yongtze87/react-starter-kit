import { Drawer } from "vaul";
import { Link } from "react-router";
import { X, ExternalLink } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import {
  calcMidPremium,
  calcDTE,
  calcDailyCashFlow,
  calcAnnualizedReturnCC,
  calcAnnualizedReturnCSP,
  calcOTMPercent,
  getRiskCategory,
  calcBreakEvenCC,
  calcBreakEvenCSP,
} from "~/lib/optionsCalculations";

export interface TradeDetailProps {
  ticker: string;
  stockPrice: number;
  strike: number;
  expiration: string;
  bid: number;
  ask: number;
  mode: "cc" | "csp";
  sharesOwned?: number;
  costBasis?: number;
}

interface Props {
  trade: TradeDetailProps | null;
  onClose: () => void;
}

const TASTYTRADE_URL = import.meta.env.VITE_TASTYTRADE_AFFILIATE_URL ?? "";
const IBKR_URL = import.meta.env.VITE_IBKR_AFFILIATE_URL ?? "";

export function TradeDetailDrawer({ trade, onClose }: Props) {
  if (!trade) return null;

  const mid = calcMidPremium(trade.bid, trade.ask);
  const dte = calcDTE(trade.expiration);
  const premiumDollars = mid * 100;
  const dailyCash = calcDailyCashFlow(mid, dte);
  const annReturn =
    trade.mode === "cc"
      ? calcAnnualizedReturnCC(mid, trade.stockPrice, dte)
      : calcAnnualizedReturnCSP(mid, trade.strike, dte);
  const otmPct = calcOTMPercent(trade.strike, trade.stockPrice);
  const risk = getRiskCategory(otmPct);
  const breakEven =
    trade.mode === "cc"
      ? calcBreakEvenCC(trade.strike, mid)
      : calcBreakEvenCSP(trade.strike, mid);

  const expLabel = new Date(trade.expiration + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const strategyLabel = trade.mode === "cc" ? "Covered Call" : "Cash-Secured Put";
  const capitalRequired =
    trade.mode === "cc" ? trade.stockPrice * 100 : trade.strike * 100;

  const aiQuery = encodeURIComponent(
    `I'm looking at a ${strategyLabel} on ${trade.ticker}: ` +
    `$${trade.strike} strike, expires ${expLabel}. ` +
    `Premium: $${premiumDollars.toFixed(0)}, daily cash flow: $${dailyCash.toFixed(2)}, ` +
    `annualized return: ${annReturn.toFixed(1)}%. Can you explain this trade in plain English?`
  );

  // Margin call warning: only relevant for CC where stock might move up
  const showMarginWarning = trade.mode === "cc";
  // Combined P&L (informational, uses cost basis vs current price)
  const showCombinedPL = trade.mode === "cc" && trade.sharesOwned && trade.costBasis;
  const stockPL = showCombinedPL
    ? (trade.stockPrice - trade.costBasis!) * trade.sharesOwned!
    : null;

  return (
    <Drawer.Root open={true} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0A0B0D] rounded-t-2xl max-h-[92vh] flex flex-col max-w-[760px] mx-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-[#E5E9F0] dark:bg-[#1E2330]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 border-b border-[#E5E9F0] dark:border-[#1E2330] shrink-0">
            <div>
              <h2 className="font-bold text-base">
                {trade.ticker} ${trade.strike} {strategyLabel}
              </h2>
              <p className="text-xs text-gray-500">Expires {expLabel} · {dte}d remaining</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F5F8FF] dark:hover:bg-[#1E2330]">
              <X size={18} />
            </button>
          </div>

          {/* Body — scrollable */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
            {/* Key metrics */}
            <div className="rounded-xl bg-[#F5F8FF] dark:bg-[#13171F] p-4 space-y-2">
              <Row label="Premium collected" value={`$${premiumDollars.toFixed(2)}`} valueClass="font-semibold text-[#05B169]" />
              <Row label="Daily cash flow" value={`$${dailyCash.toFixed(2)} / day`} valueClass="font-semibold tabular-nums" />
              <Row
                label="Annualized return"
                value={`${annReturn.toFixed(1)}%`}
                sub={`on $${capitalRequired.toLocaleString()} capital`}
                valueClass="font-semibold tabular-nums"
              />
              <Row label="Break-even" value={`$${breakEven.toFixed(2)}`} valueClass="tabular-nums" />
            </div>

            {/* Risk summary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Risk summary</h3>
                <RiskBadge risk={risk} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {trade.mode === "cc" ? (
                  <>
                    If {trade.ticker} closes above <strong>${trade.strike}</strong> at expiry, your 100 shares are sold at that price.
                    Effective exit price: <span className="tabular-nums">${breakEven.toFixed(2)}</span> (+premium).
                    If it stays below, you keep the ${premiumDollars.toFixed(0)} premium and your shares.
                  </>
                ) : (
                  <>
                    If {trade.ticker} closes below <strong>${trade.strike}</strong> at expiry, you buy 100 shares at that price.
                    Your net cost after premium: <span className="tabular-nums">${breakEven.toFixed(2)}</span> per share.
                    If it stays above, you keep the ${premiumDollars.toFixed(0)} premium.
                  </>
                )}
              </p>
            </div>

            {/* Combined P&L for CC positions with cost basis */}
            {showCombinedPL && stockPL !== null && (
              <div className="rounded-xl border border-[#E5E9F0] dark:border-[#1E2330] p-4">
                <h3 className="font-semibold text-sm mb-3">Your position today</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{trade.sharesOwned} shares</span>
                    <span className={`tabular-nums font-medium ${stockPL >= 0 ? "text-[#05B169]" : "text-[#DF5F67]"}`}>
                      {stockPL >= 0 ? "+" : ""}${stockPL.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Option premium (if sold now)</span>
                    <span className="tabular-nums font-medium text-[#05B169]">+${premiumDollars.toFixed(0)}</span>
                  </div>
                  <div className="border-t border-[#E5E9F0] dark:border-[#1E2330] pt-1 mt-1 flex justify-between font-semibold">
                    <span>Net</span>
                    <span className={`tabular-nums ${(stockPL + premiumDollars) >= 0 ? "text-[#05B169]" : "text-[#DF5F67]"}`}>
                      {(stockPL + premiumDollars) >= 0 ? "+" : ""}${(stockPL + premiumDollars).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Affiliate links */}
            {(TASTYTRADE_URL || IBKR_URL) && (
              <div className="flex gap-2">
                {TASTYTRADE_URL && (
                  <a
                    href={TASTYTRADE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-[#E5E9F0] dark:border-[#1E2330] rounded-lg py-2.5 hover:bg-[#F5F8FF] dark:hover:bg-[#13171F] transition-colors"
                  >
                    Trade on Tastytrade <ExternalLink size={12} />
                  </a>
                )}
                {IBKR_URL && (
                  <a
                    href={IBKR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-[#E5E9F0] dark:border-[#1E2330] rounded-lg py-2.5 hover:bg-[#F5F8FF] dark:hover:bg-[#13171F] transition-colors"
                  >
                    Open in IBKR <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}

            {/* Ask AI */}
            <Link
              to={`/dashboard/chat?q=${aiQuery}`}
              className="w-full flex items-center justify-center gap-2 bg-[#F5F8FF] dark:bg-[#13171F] border border-[#E5E9F0] dark:border-[#1E2330] rounded-xl py-3 text-sm font-medium text-[#0052FF] hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
            >
              Ask AI about this trade →
            </Link>
          </div>

          {/* Margin caveat — always visible */}
          <div className="shrink-0 px-5 py-3 border-t border-[#E5E9F0] dark:border-[#1E2330]">
            <p className="text-[11px] text-gray-400 text-center">
              On margin accounts, check your broker's margin requirements for short positions before trading.
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Row({
  label,
  value,
  sub,
  valueClass = "",
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="text-right">
        <span className={`text-sm ${valueClass}`}>{value}</span>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}
