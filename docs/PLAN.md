# Premia — Implementation Plan

## Context

Build a simplified options income tool (Premia) for retail traders pursuing consistent cash flow strategies (the "wheel" and related approaches). The key differentiator: present options in *cash flow income terms* — daily dollars and annualized return % — instead of Greeks. Target users: beginners (no jargon) and intermediates (want faster workflow than spreadsheets). Present math facts only — same framing as a mortgage calculator.

**Data strategy:** Mock data first with a clean abstraction layer. Real Tradier API wires in during Phase 2 without touching components.

> **Note on ASCII mockups throughout this plan:** The ASCII art below represents *data layout and logic* only — which fields appear and in what order. The actual mobile UI uses vertical cards, collapsible filter sheets, and a bottom tab bar. ASCII art is NOT a mobile wireframe.

---

## Brand & Design System

**App name: Premia** — Tagline: *"Your stocks, working harder."*

### Colors (Coinbase-inspired)
```
Primary blue:    #0052FF
Primary hover:   #0039B3

Light mode:  bg #FFFFFF · surface #F5F8FF · text #050F19 · muted #6B7280 · border #E5E9F0
Dark mode:   bg #0A0B0D · surface #13171F · text #FFFFFF · muted #9CA3AF · border #1E2330

Semantic:
  Success:      #05B169   (profit, positive P&L)
  Danger:       #DF5F67   (loss, negative P&L)
  Warning:      #F59E0B   (approaching strike, margin caveat)
  Conservative: #3B82F6   (risk badge)
  Moderate:     #F59E0B
  Aggressive:   #DF5F67
```

### Typography
- **Font:** Inter — tabular nums (`font-variant-numeric: tabular-nums`) on all financial figures

### Dark / Light Mode
- Tailwind `dark:` throughout; system default on first visit; localStorage toggle in Account tab

### Pricing (Phase 2)
| Plan | Price | Features |
|---|---|---|
| **Free** | $0 | Auth · Search · CC/CSP/Wheel/Spread grid · Scanner top 5 · Watchlist (view only) |
| **Pro** | $15/month | All free · Full scanner · Portfolio simulator · Anomaly alerts · CSV export · Ask AI |
| **Pro Annual** | $150/year | Same as Pro |

---

## UX & Design System

### Layout Philosophy
- **Mobile-first fluid portrait**: single centered column, `width: 100%` on mobile
- **Desktop auto-extends**: same layout, `max-width` grows with viewport (480px → 600px → 760px)
- No separate desktop design — one responsive design, consistent feel everywhere
- **PWA-ready**: portrait-centered layout works as installed PWA on both mobile and desktop

### Navigation

**Marketing zone (unauthenticated):** top navbar
```
[Logo]          About   Pricing   [Sign In]   [Get Started →]
```
Mobile: hamburger menu. Desktop: inline links.

**App zone (authenticated):** bottom tab bar — identical on mobile and desktop
```
[  Search  |  Scanner  |  Watchlist  |  Account  ]
```
- **Search:** stock lookup landing, navigate to ticker analysis
- **Scanner:** scan all stocks for highest income trades
- **Watchlist:** recently viewed tickers (Phase 1 — auto-populated); user-managed favorites (Phase 2 — for anomaly detection)
- **Account:** settings, dark/light toggle, plan, sign out

The existing left sidebar (`app-sidebar.tsx`) is replaced by this bottom tab bar for all trader routes.

### Landing Page — Product-Led
Search and Simple View work without login. Paywall appears only at moment of value.

```
[Top navbar]

Hero: "Generate income from your stocks"
Sub:  "No Greeks. No jargon. Just the trade."

[Search box — works without login]   or   [Scan top income trades →]

↓ Best income trade result appears immediately (no login required)

┌─────────────────────────────────────┐
│  AAPL  $185.00                      │
│  Best income trade today            │
│  Covered Call · $195 · Apr 25       │
│  17.9% ann · $9.10/day             │
│  [See detail]  [🔒 Add to Watchlist]│ ← lock triggers sign-up
└─────────────────────────────────────┘

[How it works]  [Pricing]
[Footer: About · Terms · Privacy · Not financial advice]
```

Gated actions: "Add to Watchlist", "See all scanner results", "Ask AI" → inline sign-up modal.

### Google Auth
Clerk supports Google OAuth via dashboard config — no code change needed. Enable in Clerk dashboard. Email/password fallback. Sign-up modal appears inline on gated action.

### Onboarding (Phase 2 — NOT Phase 1)
3-screen onboarding flow and concept tutorial cards deferred to Phase 2. In Phase 1, users land directly in Search after login. The `userTutorialState` schema table is included in Phase 1 for forward-compatibility but its logic ships in Phase 2.

### Ticker Analysis Page — Simple View by Default
Default shows best pick per strategy:

```
AAPL  $185.00  ·  I own [100] shares  ·  Cost basis [$170]

Best income trades today

┌──────────────────────────────────────┐
│  Covered Call                        │
│  $195 call · Apr 25 · 21d            │
│  17.9% ann  ·  $9.10/day            │
│  Moderate risk                       │
│  [Detail]      [Add to Watchlist]    │
└──────────────────────────────────────┘
... (one card per strategy)

[Explore all CC options ↓]   ← expands inline
[Grid View]                  ← shows full 2D matrix
```

**Grid View** (opt-in): desktop auto-expands wider; mobile: horizontal scroll within container.
- `CostBasisBadge` on CC grid: above cost basis = green; below = red tint + "⚠ loss if called away"
- `UnderwaterPanel` when current price < cost basis

### Trade Detail Drawer
One-line grey disclaimer at bottom (always visible):
> *"On margin accounts, check your broker's margin requirements for short positions before trading."*

**Margin call education:** On CC positions where stock rises and option P&L is negative, show combined P&L display:
```
100 shares:    +$1,500  (stock ↑ $15)
Short call:      −$290  (option ↑)
─────────────────────
Net position:  +$1,210

⚠ On margin accounts, the option leg may trigger margin
  requirements independent of your share gains. Check your broker.
```
Shows only when option P&L is negative. Without cost basis: "Add your shares to see your full position."

---

## Strategies Supported

### Phase 1
1. **Covered Calls (CC)** — own 100 shares, sell call, earn premium
2. **Cash-Secured Puts (CSP)** — sell put with cash collateral, earn premium
3. **The Wheel** — combined view of the full CSP→assignment→CC cycle
4. **Bull Put Spread** — sell put + buy lower-strike put, defined risk/reward

### Phase 2 Addition
5. **Iron Condor (IC)** — sell OTM put spread + sell OTM call spread; profit if stock stays in range

---

## Key Calculations (`app/lib/optionsCalculations.ts`)

```ts
// Shared
midPremium = (bid + ask) / 2
premiumDollars = midPremium * 100
dte = max(1, days between today and expirationDate)
dailyCashFlow = premiumDollars / dte

// Covered Call
annualizedReturn_CC = (premiumDollars / (stockPrice * 100)) * (365 / dte) * 100
breakEven_CC = strikePrice + midPremium

// Cash-Secured Put
annualizedReturn_CSP = (premiumDollars / (strikePrice * 100)) * (365 / dte) * 100
breakEven_CSP = strikePrice - midPremium

// Bull Put Spread
netPremium = shortPutMid - longPutMid
netPremiumDollars = netPremium * 100
capitalRequired = (shortStrike - longStrike - netPremium) * 100
maxLoss = (shortStrike - longStrike) * 100 - netPremiumDollars
annualizedReturn_Spread = (netPremiumDollars / capitalRequired) * (365 / dte) * 100
breakEven_Spread = shortStrike - netPremium

// Iron Condor (Phase 2)
netPremium_IC = (shortPutMid + shortCallMid) - (longPutMid + longCallMid)
netPremiumDollars_IC = netPremium_IC * 100
capitalRequired_IC = max(shortPutStrike - longPutStrike, shortCallStrike - longCallStrike) * 100 - netPremiumDollars_IC
annualizedReturn_IC = (netPremiumDollars_IC / capitalRequired_IC) * (365 / dte) * 100
upperBreakEven_IC = shortCallStrike + netPremium_IC
lowerBreakEven_IC = shortPutStrike - netPremium_IC

// The Wheel
netCostBasis = cspStrike - cspMidPremium
effectiveExitPrice = ccStrike + ccMidPremium
totalCycleProfit = (effectiveExitPrice - netCostBasis) * 100
cycleAnnualizedReturn = (totalCycleProfit / (cspStrike * 100)) * (365 / totalDTE) * 100

// Risk category
otmPercent = |strikePrice - stockPrice| / stockPrice * 100
>= 10% → Conservative | >= 5% → Moderate | < 5% → Aggressive
```

---

## Data Abstraction Layer (`app/lib/marketData.ts`)

```ts
interface StockQuote { ticker, name, price, weekHigh52, weekLow52 }
interface OptionContract { strike, expiration, optionType: 'call'|'put', bid, ask, mid, volume, openInterest }
interface MarketDataProvider {
  getStockQuote(ticker): Promise<StockQuote>
  getExpirationDates(ticker): Promise<string[]>
  getOptionsChain(ticker, expiration): Promise<OptionContract[]>
  searchTickers(query): Promise<{ ticker, name }[]>
}
```

**`convex/lib/mockMarketData.ts`** — implements mock provider. Exports `STOCK_UNIVERSE` (~83 tickers, 4 volatility tiers). Used by Convex queries.

Stock universe volatility tiers:
```
tier 1 (low-vol):  JNJ, PG, KO, T, VZ ...         → IV ~17%
tier 2 (mid-vol):  AAPL, MSFT, GOOGL, JPM, BAC ... → IV ~28%
tier 3 (high-vol): TSLA, NVDA, AMD, META, NFLX ...  → IV ~52%
tier 4 (index):    SPY, QQQ, IWM, GLD, EEM ...      → IV ~15%
```

Mock premium formula:
```ts
theoreticalPremium = stockPrice * annualizedIV * sqrt(dte / 365) * OTM_DISCOUNT
// OTM_DISCOUNT: 1.0 at ATM, 0.5 at 2.5% OTM, 0.15 at 5% OTM, 0.03 at 10% OTM
bid = theoreticalPremium * 0.92
ask = theoreticalPremium * 1.08
```

**`convex/lib/optionsCalculations.ts`** — same math for Convex queries (scanner).
**`app/lib/optionsCalculations.ts`** — same math for frontend components (WheelCalculator, OptionCell, TradeDetailDrawer).

**`app/lib/tradierMarketData.ts`** — Tradier implementation (Phase 2 only). Swap in by changing one import.

---

## Route Structure

```
/                                    → landing page (search works without auth)        [Phase 1 ✓]
/dashboard/trader                    → stock search landing                            [Phase 1 ✓]
/dashboard/trader/scanner            → income scanner                                  [Phase 1 ✓]
/dashboard/trader/watchlist          → watchlist + recent tickers                      [Phase 1 basic ✓]
/dashboard/trader/:ticker            → ticker analysis (CC | CSP | Wheel | Put Spread) [Phase 1 ✓]
/dashboard/trader/portfolio          → portfolio simulator                              [Phase 2]
/dashboard/trader/:ticker            → add Iron Condor tab                             [Phase 2]
```

Auth guard in `app/routes/dashboard/layout.tsx` — Clerk SSR auth only (no subscription gate in Phase 1).
Trader-specific layout in `app/routes/dashboard/trader/layout.tsx` — bottom tab bar.

---

## Convex Schema Additions (`convex/schema.ts`)

All 6 tables defined in Phase 1 schema for forward-compatibility. Some table logic ships in Phase 2.

```ts
optionsCache, stockQuoteCache, userWatchlist, userStockSettings,
userTutorialState (schema only; onboarding logic Phase 2),
portfolioPositions (schema only; portfolio UI Phase 2)
```

---

## Files Implemented — Phase 1

### Backend (`convex/`)
| File | Status |
|---|---|
| `convex/schema.ts` | ✓ Updated — all 6 new tables added |
| `convex/http.ts` | ✓ Updated — options-focused AI system prompt |
| `convex/options.ts` | ✓ Created — `getStockQuote`, `getExpirationDates`, `getOptionsChain`, `searchTickers` |
| `convex/scanner.ts` | ✓ Created — `scanAllStocks` query (CC, CSP, BullPutSpread) |
| `convex/watchlist.ts` | ✓ Created — `addToWatchlist`, `getWatchlist`, `removeFromWatchlist` |
| `convex/stockSettings.ts` | ✓ Created — `setStockSettings`, `getStockSettings` |
| `convex/lib/mockMarketData.ts` | ✓ Created — STOCK_UNIVERSE + chain generator |
| `convex/lib/optionsCalculations.ts` | ✓ Created — math for scanner |

### Frontend lib + hooks
| File | Status |
|---|---|
| `app/lib/optionsCalculations.ts` | ✓ Created — math for WheelCalculator, OptionCell, TradeDetailDrawer |
| `app/lib/marketData.ts` | ✓ Created — type definitions |
| `app/hooks/useSubscription.ts` | ✓ Created — stub returning "pro" |

### Routes
| File | Status |
|---|---|
| `app/routes.ts` | ✓ Updated — trader routes registered |
| `app/routes/home.tsx` | ✓ Updated — product-led landing page |
| `app/routes/dashboard/layout.tsx` | ✓ Updated — auth guard only (subscription gate removed) |
| `app/routes/dashboard/trader/layout.tsx` | ✓ Created — bottom tab bar |
| `app/routes/dashboard/trader/index.tsx` | ✓ Created — search landing |
| `app/routes/dashboard/trader/scanner.tsx` | ✓ Created — income scanner |
| `app/routes/dashboard/trader/watchlist.tsx` | ✓ Created — recently viewed |
| `app/routes/dashboard/trader/ticker.tsx` | ✓ Created — ticker analysis |

### Components (`app/components/trader/`)
| Component | Status |
|---|---|
| `StockSearchInput.tsx` | ✓ Created — debounced autocomplete |
| `StockHeader.tsx` | ✓ Created — price, range bar, shares/cost basis inputs |
| `OptionsGrid.tsx` | ✓ Created — CC/CSP grid with expiry rows |
| `OptionCell.tsx` | ✓ Created — $/day + ann%, top3 highlight, cost basis badge |
| `TradeDetailDrawer.tsx` | ✓ Created — vaul drawer, plain-English, margin caveat |
| `RiskBadge.tsx` | ✓ Created |
| `SpreadGrid.tsx` | ✓ Created — Bull Put Spread with width selector |
| `WheelCalculator.tsx` | ✓ Created — two-phase calculator + cycle summary |
| `ScannerFilters.tsx` | ✓ Created — mobile bottom sheet |
| `ScannerResultsTable.tsx` | ✓ Created — paginated, sortable, capital-filtered |
| `RecentTickersList.tsx` | ✓ Created |
| `CostBasisBadge.tsx` | ✓ Created |
| `UnderwaterPanel.tsx` | ✓ Created |
| `UpgradeCTA.tsx` | ✓ Created — stub (gates Phase 2) |

---

## New Files — Phase 2

**Portfolio Simulator:**
- `convex/portfolio.ts` — position CRUD, live P&L, trade history
- `app/routes/dashboard/trader/portfolio.tsx`
- Components: `PortfolioSummaryCard`, `PositionCard`, `PositionStatusBadge`, `AddPositionDrawer`, `TradeHistoryTable`

**Iron Condor:**
- `app/components/trader/IronCondorGrid.tsx`

**Onboarding:**
- 3-screen flow after first login (goal → capital → first stock)
- Concept tutorial (3 swipeable cards: CC, CSP, What the app does)
- Coach marks: one-time tooltips pointing at UI elements

**Watchlist (user-managed):**
- UI to add/remove/reorder up to 20 favourite tickers
- Separate from "recently viewed" auto-list
- Powers anomaly detection scan

**Anomaly Detection (Premium feature):**
- Scans only user's watchlist tickers (max 20)
- Detects term structure inversions: same-strike option with shorter DTE has higher *dollar premium* than longer DTE
- Filters: min open interest (liquidity), exclude dividends between the two dates
- Results: top 10 anomalies by magnitude (shorter/longer dollar premium delta)
- UX: user-triggered scan on Watchlist tab → "Anomaly alerts" section
- Gate: Premium subscription only

**Real Data:**
- `app/lib/tradierMarketData.ts`
- Swap mock → Tradier in `convex/options.ts` + `convex/scanner.ts`
- Cache: 15-min TTL during market hours

**Phase 2 Monetization Gates (actual):**
- Scanner: free = top 5 rows blurred, Pro = all results
- Ask AI: Pro only
- Portfolio: free = 1 position, Pro = 20
- Anomaly detection: Pro only
- CSV export: Pro only
- Real-time Tradier data: Pro only

---

## Phase 3 — Polish
1. Earnings calendar warning (flag expiries crossing earnings dates)
2. Top-3 cell ring highlighting in grids
3. CSV export (Pro)
4. Lazy-load additional expiry chains beyond first 3
5. Expand `STOCK_UNIVERSE` toward full S&P 500
6. Mobile horizontal scroll optimization in grid view

---

## Verification (Phase 1)

1. `npm run dev` + `npx convex dev` → navigate to `/dashboard/trader`
2. Search "AAPL" → mock quote loads, expiry dates populate
3. CC tab → grid renders with $/day + ann % per cell; top-row expiry marked with 🏆
4. Click a cell → `TradeDetailDrawer` shows plain-English breakdown with correct math
5. CSP tab → annualized return uses `strikePrice * 100` as capital (not stock price)
6. Put Spread tab → max loss = spread width - net premium; ann return uses `capitalRequired`
7. Wheel tab → cycle return uses net cost basis + effective exit price
8. Manual math check: AAPL $190 call, bid $1.80 ask $2.00, 21 DTE, stock $185
   - mid = $1.90, premium = $190, daily = $9.05/day, ann = ($190/$18,500) × (365/21) × 100 = 17.8%
9. Scanner page → runs on load, capital filter works client-side, grays unaffordable rows
10. Click scanner row → navigates to ticker page
11. Bottom tab bar renders on both mobile (375px) and desktop (1200px)
12. Affiliate links: set `VITE_TASTYTRADE_AFFILIATE_URL` → button appears in drawer; unset → hidden
13. `useSubscription` returns "pro" → no upgrade prompts block any feature in Phase 1
14. Landing page `/` → search AAPL → shows best CC preview; sign-up CTA to see all trades
