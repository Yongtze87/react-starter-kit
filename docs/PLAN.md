# Premia — Implementation Plan

## Context

Build a simplified options income tool for traders pursuing consistent cash flow strategies (the "wheel" and related approaches). The key differentiator: present options in *cash flow income terms* — daily dollars and annualized return % — instead of Greeks (delta/gamma/theta). No existing tool targets this framing cleanly.

**App name: Premia** — plural of "premium" in finance. Clean, 6 letters, sounds like a credible fintech product. Subtly tells the user exactly what the app is about without requiring explanation.

**Target users:** Both beginners (want simple, no jargon) and intermediate traders (know the wheel strategy, want a faster workflow than spreadsheets).

**Not financial advice:** Present math facts only. Same framing as a mortgage calculator.

**Data source:** Build with mock data first using a clean abstraction layer. Real API (Tradier recommended) wires in later without touching components.

---

## Brand & Design System

### App Name
**Premia** — wordmark in clean sans-serif. Tagline: *"Your stocks, working harder."*

### Colors (Coinbase-inspired)
```
Primary blue:    #0052FF   (Coinbase signature blue — CTAs, links, active states)
Primary hover:   #0039B3   (darker blue for hover)

Light mode:
  Background:    #FFFFFF
  Surface:       #F5F8FF   (subtle blue tint on cards)
  Text primary:  #050F19
  Text muted:    #6B7280
  Border:        #E5E9F0

Dark mode:
  Background:    #0A0B0D
  Surface:       #13171F
  Text primary:  #FFFFFF
  Text muted:    #9CA3AF
  Border:        #1E2330

Semantic:
  Success:       #05B169   (profit, positive P&L)
  Danger:        #DF5F67   (loss, negative P&L, warning)
  Warning:       #F59E0B   (approaching strike, margin caveat)
  Conservative:  #3B82F6   (risk badge — blue)
  Moderate:      #F59E0B   (risk badge — amber)
  Aggressive:    #DF5F67   (risk badge — red)
```

### Typography
- **Font:** Inter (same as Coinbase) — already available via Tailwind/system stack
- **Numbers:** Tabular nums (`font-variant-numeric: tabular-nums`) for all financial figures so columns align

### Dark / Light Mode
- Tailwind `dark:` variant throughout
- System default (`prefers-color-scheme`) on first visit
- User can toggle in Account tab; preference saved to `localStorage`
- Convex does not need to store this — purely client-side

### Pricing
| Plan | Price | Features |
|---|---|---|
| **Free** | $0 | Auth required · Ticker search · Simple View · Scanner top 5 · Portfolio 1 position |
| **Pro** | **$15/month** | All free features · Full scanner · CSV export · Ask AI · Portfolio up to 20 positions |
| **Pro Annual** | **$150/year** (~$12.50/mo, 2 months free) | Same as Pro |

Polar product setup: two prices on one product (monthly + annual). Upgrade CTA links to `/pricing`.

---


## UX & Design System

### Layout Philosophy
- **Mobile-first fluid portrait**: single centered column, `width: 100%` on mobile
- **Desktop auto-extends**: same layout, `max-width` grows with viewport (480px → 600px → 760px), never breaks into a wide multi-column layout
- **No separate desktop design needed**: one responsive design, consistent feel across all screen sizes
- **PWA-ready**: portrait-centered layout matches installed PWA on both mobile and desktop

### Navigation — Two Zones

**Marketing zone (unauthenticated):** standard top navbar
```
[Logo]          About   Pricing   [Sign In]   [Get Started →]
```
Mobile: hamburger menu. Desktop: inline links.

**App zone (authenticated):** bottom tab bar at the base of the centered column — identical on mobile and desktop
```
[  Search  |  Scanner  |  Portfolio  |  Account  ]
```
The existing left sidebar (`app-sidebar.tsx`) is replaced by this bottom tab bar for all trader routes. 4 tabs = perfect for bottom nav.

### Landing Page — Product-Led
The landing page IS the product in demo mode. Search and Simple View work without login. Paywall appears only at the moment of value.

```
[Top navbar]

Hero: "Generate income from your stocks"
Sub:  "No Greeks. No jargon. Just the trade."

[Search box — works without login]
or [Scan top income trades →]

↓ Simple View result appears immediately (no login required)

┌─────────────────────────────────────┐
│  AAPL  $185.00                      │
│  Best income trade today            │
│  Covered Call · $195 · Apr 25       │
│  17.9% ann · $9.10/day             │
│  [See detail]  [🔒 Add to Portfolio]│ ← lock icon triggers sign-up
└─────────────────────────────────────┘

[How it works section]
[Pricing section]
[Footer: About · Terms · Privacy · Not financial advice]
```

Gated actions: "Add to Portfolio", "See all scanner results", "Ask AI" → trigger sign-up modal (not a page redirect).

### Google Auth
Clerk supports Google OAuth via dashboard config — no code change. **Must be enabled.** Email/password as fallback. Sign-up modal appears inline when hitting a gated action.

### Onboarding (3 screens, always skippable)
Shown once after first login, before landing in the app.

**Screen 1 — Goal** (seeds default strategy tab + tutorial path)
- "I own stocks and want income" → CC-first
- "I want to buy stocks at a discount" → CSP-first
- "I'm new to options, exploring" → Scanner with tutorial active

**Screen 2 — Capital** (seeds scanner capital filter)
- Single number input: "How much capital are you working with?"

**Screen 3 — First stock** (if goal = CC; seeds `userStockSettings`)
- Search to add stocks with share count + cost basis
- Skip available

### Concept Tutorial (3 swipeable cards, shown once after onboarding)
Explains *what options income is* before user sees any data. Each card has expandable "Learn more" sections for users who want depth.

**Card 1 — Covered Calls**
> "Your stocks can pay you. Sell the right to buy your shares at a fixed price — collect cash today, upfront. You keep the premium regardless. If the stock closes above the strike at expiry, your shares are sold at that price. Your upside is capped — that's the trade-off."

Expandables:
- "What is assignment?" — explains shares being called away
- "What if the stock shoots up?" — explains the cap on upside; notes that on margin accounts, the short call's rising value may trigger broker margin requirements before expiry even though your shares offset it (real risk — happened to real users)
- "Is this risky?" — honest answer: premium is safe, upside is capped, margin accounts add complexity

**Card 2 — Cash-Secured Puts**
> "Get paid to buy stocks at a discount. Sell the right to sell a stock to you at a lower price. If it drops there, you buy 100 shares — but your real cost is lower because you kept the premium."

Expandables:
- "What does 'cash-secured' mean?" — you hold the full cash to buy the shares; no margin needed, no margin call risk
- "What if the stock keeps dropping?" — honest downside scenario

**Card 3 — What this app does**
> "We scan 100+ stocks and find the highest-income trades — ranked by annualized return on your capital. Not financial advice — this is a calculator, like a mortgage calculator for options."

CTA: "Find my first trade →"

### In-App Coach Marks (after concepts understood)
One-time tooltips pointing at UI elements (not re-explaining finance):
- First Search tab visit: "Search any stock to see its best income trades"
- First result card: "Tap to see the full breakdown in plain English"
- First Trade Detail: "Paper trade this — no real money. Come back to see how it's doing"
- First Portfolio visit: "Your paper trades live here. History builds over time"

Stored in Convex `userTutorialState` (simple string array of seen coach mark IDs).

### Ticker Analysis Page — Simple View by Default
Default shows best pick per strategy (ranked by annualized %, $/day shown alongside):

```
AAPL  $185.00  ·  I own [100] shares  ·  Cost basis [$170]

Best income trades today

┌──────────────────────────────────────┐
│  Covered Call                        │
│  $195 call · Apr 25 · 21d            │
│  17.9% ann  ·  $9.10/day            │
│  Moderate risk                       │
│  [Detail]      [Add to Portfolio]    │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│  Cash-Secured Put                    │
│  $182 put · Apr 25 · 21d             │
│  14.2% ann  ·  $6.80/day            │
│  Conservative risk                   │
│  [Detail]      [Add to Portfolio]    │
└──────────────────────────────────────┘
  ... (one card per strategy)

[Explore all CC options ↓]   ← expands inline to 5 more picks
[Explore all CSP options ↓]
[Grid View]                  ← shows full 2D matrix
```

**Grid View** (opt-in toggle):
- Desktop: container auto-expands wider, full matrix visible
- Mobile: horizontal scroll within grid container
- `CostBasisBadge` on CC grid columns: above cost basis = green, below = red tint + "⚠ loss if called away"
- `UnderwaterPanel` appears above grid when current price < cost basis

### Portfolio Simulator — Combined P&L Display
For CC positions where cost basis is entered, show both legs together:

```
AAPL  Covered Call  ·  $195  ·  Apr 25
─────────────────────────────────────
100 shares:    +$1,500  (stock ↑ $15)
Short call:      −$290  (option ↑)
─────────────────────────────────────
Net position:  +$1,210

⚠ On margin accounts, the option leg may
  trigger margin requirements independent
  of your share gains. Check your broker.
```

Warning shows only when option P&L is negative (stock moved against the call). If cost basis not entered, show option P&L only with note: "Add your shares to see your full position."

### Trade Detail Drawer — Margin Caveat
One-line grey disclaimer at bottom of drawer (always visible, not expandable):
> *"On margin accounts, check your broker's margin requirements for short positions before trading."*

---


## Strategies Supported

1. **Covered Calls (CC)** — own 100 shares, sell call, earn premium
2. **Cash-Secured Puts (CSP)** — sell put with cash collateral, earn premium
3. **The Wheel** — combined view of the full CSP→assignment→CC cycle
4. **Bull Put Spread** — sell put + buy lower-strike put, defined risk/reward
5. **Iron Condor (IC)** — sell OTM put spread + sell OTM call spread simultaneously; profit if stock stays within a range

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
breakEven_CC = strikePrice + midPremium   // effective exit price if called away

// Cash-Secured Put
annualizedReturn_CSP = (premiumDollars / (strikePrice * 100)) * (365 / dte) * 100
breakEven_CSP = strikePrice - midPremium  // net cost if assigned

// Bull Put Spread
netPremium = shortPutMid - longPutMid
netPremiumDollars = netPremium * 100
capitalRequired = (shortStrike - longStrike - netPremium) * 100
maxLoss = (shortStrike - longStrike) * 100 - netPremiumDollars
annualizedReturn_Spread = (netPremiumDollars / capitalRequired) * (365 / dte) * 100
breakEven_Spread = shortStrike - netPremium

// Iron Condor
netPremium_IC = (shortPutMid + shortCallMid) - (longPutMid + longCallMid)
netPremiumDollars_IC = netPremium_IC * 100
capitalRequired_IC = max(shortPutStrike - longPutStrike, shortCallStrike - longCallStrike) * 100 - netPremiumDollars_IC
maxProfit_IC = netPremiumDollars_IC
maxLoss_IC = capitalRequired_IC
annualizedReturn_IC = (netPremiumDollars_IC / capitalRequired_IC) * (365 / dte) * 100
upperBreakEven_IC = shortCallStrike + netPremium_IC
lowerBreakEven_IC = shortPutStrike - netPremium_IC

// The Wheel (scenario calculator)
netCostBasis = cspStrike - cspMidPremium        // effective purchase price after assignment
effectiveExitPrice = ccStrike + ccMidPremium    // effective sell price after CC called away
totalCycleProfit = (effectiveExitPrice - netCostBasis) * 100
totalCyclePremium = (cspMidPremium + ccMidPremium) * 100
cycleAnnualizedReturn = (totalCycleProfit / (cspStrike * 100)) * (365 / totalDTE) * 100

// Risk category (OTM distance)
otmPercent = |strikePrice - stockPrice| / stockPrice * 100
>= 10% → Conservative | >= 5% → Moderate | < 5% → Aggressive
```

---

## Data Abstraction Layer (`app/lib/marketData.ts`)

Define typed interfaces so mock and real implementations are interchangeable:

```ts
interface StockQuote {
  ticker: string; name: string; price: number;
  weekHigh52: number; weekLow52: number;
}

interface OptionContract {
  strike: number; expiration: string; optionType: 'call' | 'put';
  bid: number; ask: number; volume: number; openInterest: number;
}

interface MarketDataProvider {
  getStockQuote(ticker: string): Promise<StockQuote>;
  getExpirationDates(ticker: string): Promise<string[]>;
  getOptionsChain(ticker: string, expiration: string): Promise<OptionContract[]>;
  searchTickers(query: string): Promise<{ ticker: string; name: string }[]>;
}
```

**`app/lib/mockMarketData.ts`** — implements `MarketDataProvider` with realistic hardcoded data (AAPL, TSLA, SPY, etc.) covering a range of strikes and expiry dates. Also exports `STOCK_UNIVERSE` — ~100 major tickers with price + volatility tier used by the scanner.

**Stock universe volatility tiers** (drives premium generation):
```
tier 1 (low-vol):  JNJ, PG, KO, T, VZ            → IV ~15–20%
tier 2 (mid-vol):  AAPL, MSFT, GOOGL, JPM, BAC    → IV ~25–30%
tier 3 (high-vol): TSLA, NVDA, AMD, META, NFLX     → IV ~45–60%
tier 4 (index):    SPY, QQQ, IWM                   → IV ~12–18%
```
Premium formula for mock generator:
```ts
annualizedIV = VOLATILITY_TIER_MAP[tier]            // e.g. 0.30 for tier 2
theoreticalPremium = stockPrice * annualizedIV * sqrt(dte / 365) * OTM_DISCOUNT
// OTM_DISCOUNT: 1.0 at ATM, 0.5 at 2.5% OTM, 0.15 at 5% OTM, 0.03 at 10% OTM
bid = theoreticalPremium * 0.92
ask = theoreticalPremium * 1.08
```

**`app/lib/tradierMarketData.ts`** — implements `MarketDataProvider` using Tradier API (built in Phase 2, swapped in by changing one import in `convex/options.ts`).

---

## Route Structure

All under existing `dashboard/layout.tsx` (auth + subscription guards inherited):

```
/dashboard/trader                    → stock search landing
/dashboard/trader/scanner            → income scanner (scan 500+ stocks)  ← NEW
/dashboard/trader/portfolio          → portfolio simulator                 ← NEW
/dashboard/trader/best-trades        → best trade finder (listed BEFORE /:ticker)
/dashboard/trader/:ticker            → main analysis page (5 tabs)
```

Register in `app/routes.ts`.

---

## New Files

### Backend (`convex/`)

**`convex/options.ts`** — server-side market data actions
- `getStockQuote(ticker)` — currently calls mock, later calls Tradier proxy
- `getExpirationDates(ticker)` — list of available expiry dates
- `getOptionsChain(ticker, expiration)` — full chain for one expiry

**`convex/scanner.ts`** — bulk scan action ← NEW
- `scanAllStocks({ strategies, maxDTE, minDTE, minAnnReturn })` → returns flat array of `ScanResult[]`
- Iterates the full `STOCK_UNIVERSE`, generates mock option chains, runs all calculations, returns top trades
- `ScanResult` shape: `{ ticker, name, price, strategy, strike, expiration, dte, dailyCashFlow, annReturn, capitalRequired, riskCategory }`
- Capital filter is client-side (user types their capital → rows are grayed/hidden instantly, no refetch)

**`convex/watchlist.ts`**
- `addToWatchlist`, `getWatchlist`, `removeFromWatchlist` — per user recent tickers

**`convex/portfolio.ts`** ← NEW
- `addPosition(userId, positionData)` — creates position; enforces limit (1 free / 20 paid via subscription check)
- `getOpenPositions(userId)` — open positions with live P&L (re-fetches current option price from mock data)
- `getTradeHistory(userId)` — all closed/expired/assigned positions ordered by closeDate desc; this is the permanent trade log
- `closePosition(positionId, closePremium)` — marks status = "closed", records closeDate + closePremium → realized P&L
- `expirePosition(positionId, outcome)` — marks status = "expired_worthless" | "assigned" at expiry
- `deletePosition(positionId)` — hard delete (only allowed on open positions)
- `getPortfolioSummary(userId)` — aggregate stats: open P&L, total realized P&L all-time, premium collected all-time, win rate (expired_worthless / total closed)

**`convex/stockSettings.ts`** ← NEW
- `setStockSettings(userId, ticker, sharesOwned, costBasis)` — upsert per ticker
- `getStockSettings(userId, ticker)` — returns saved settings for stock header pre-fill

**P&L calculation (same data source as options grid):**
```ts
// On getPositions(), for each open position:
currentChain = await mockProvider.getOptionsChain(ticker, expiration)
currentContract = chain.find(c => c.strike === position.strike && c.optionType === strategyType)
currentMid = (currentContract.bid + currentContract.ask) / 2
unrealizedPL = (position.entryPremium - currentMid) * 100 * position.quantity
percentOfMaxProfit = (position.entryPremium - currentMid) / position.entryPremium * 100
daysRemaining = max(0, differenceInDays(expiration, today))
```

### Frontend (`app/`)

**Routes:**
- `app/routes/dashboard/trader/index.tsx` — stock search + recent tickers teaser
- `app/routes/dashboard/trader/scanner.tsx` — income scanner: scan all stocks ← NEW
- `app/routes/dashboard/trader/portfolio.tsx` — portfolio simulator ← NEW
- `app/routes/dashboard/trader/ticker.tsx` — SSR loader fetches quote + first 3 expiry chains; renders `Tabs` (CC | CSP | Wheel | Put Spread | Iron Condor)
- `app/routes/dashboard/trader/best-trades.tsx` — best trade finder with filters

**Components (`app/components/trader/`):**

| Component | Description |
|---|---|
| `StockSearchInput.tsx` | Debounced autocomplete, navigates to `/:ticker` |
| `StockHeader.tsx` | Price, 52-week range bar, editable "I own X shares / cost basis $___" — persisted per user+ticker |
| `OptionsGrid.tsx` | Shared 2D table: rows = expiry dates, columns = strikes; `mode` prop |
| `OptionCell.tsx` | `$X.XX/day` + `X.X% ann.`, color-coded; click opens `TradeDetailDrawer` |
| `TradeDetailDrawer.tsx` | vaul bottom drawer; plain-English breakdown; "Ask AI" button |
| `RiskBadge.tsx` | Conservative / Moderate / Aggressive from `otmPercent` |
| `SpreadGrid.tsx` | Bull put spread grid; adds spread-width selector above the grid |
| `WheelCalculator.tsx` | Two-phase scenario view (CSP phase → CC phase → cycle summary card) |
| `BestTradeFilters.tsx` | DTE range, min return %, strategy type, risk category |
| `BestTradeTable.tsx` | Flat table of top trades sorted by annualized return |
| `RecentTickersList.tsx` | Last 5 tickers from Convex watchlist |
| `ScannerFilters.tsx` | Left panel: capital input, strategy checkboxes, DTE range, min %, risk ← NEW |
| `ScannerResultsTable.tsx` | Paginated table of scan results; capital filter grays unaffordable rows ← NEW |
| `IronCondorGrid.tsx` | IC grid: rows = expiry, columns = short put strike; spread width + call wing selector ← NEW |
| `PortfolioSummaryCard.tsx` | Top stats: open P&L, realized P&L, position count by status ← NEW |
| `PositionCard.tsx` | Individual position: P&L progress bar, DTE countdown, proximity-to-strike warning ← NEW |
| `PositionStatusBadge.tsx` | Open / Closed / Expired Worthless / Assigned ← NEW |
| `AddPositionDrawer.tsx` | Manual position entry form (all 5 strategies); also triggered from TradeDetailDrawer ← NEW |
| `TradeHistoryTable.tsx` | Permanent log of all closed/expired positions; sortable; shows realized P&L per trade ← NEW |
| `CostBasisBadge.tsx` | Inline indicator on CC grid cells showing position relative to cost basis (above/below/at) ← NEW |
| `UnderwaterPanel.tsx` | Warning panel + recovery options when current price < cost basis (CC context only) ← NEW |

**Lib:**
- `app/lib/optionsCalculations.ts` — all pure math (fully testable, no React)
- `app/lib/marketData.ts` — `MarketDataProvider` interface + types
- `app/lib/mockMarketData.ts` — mock implementation (Phase 1)
- `app/lib/tradierMarketData.ts` — Tradier implementation (Phase 2)

---

## Modified Files

| File | Change |
|---|---|
| `convex/schema.ts` | Add `optionsCache`, `stockQuoteCache`, `userWatchlist`, `portfolioPositions`, `userStockSettings`, `userTutorialState` tables |
| `convex/http.ts` | Update chat system prompt to options trading context |
| `app/routes.ts` | Register trader routes (search, scanner, portfolio, ticker) |
| `app/routes/home.tsx` | Replace existing landing page with product-led demo (search works without auth) |
| `app/components/dashboard/app-sidebar.tsx` | Replace sidebar with bottom tab bar for trader routes (Search, Scanner, Portfolio, Account) |

### Schema additions (`convex/schema.ts`)
```ts
optionsCache: defineTable({
  ticker: v.string(), expiration: v.string(),
  fetchedAt: v.number(), data: v.any()
}).index("by_ticker_expiry", ["ticker", "expiration"]),

stockQuoteCache: defineTable({
  ticker: v.string(), fetchedAt: v.number(),
  price: v.number(), weekHigh52: v.number(), weekLow52: v.number(), name: v.string()
}).index("by_ticker", ["ticker"]),

userWatchlist: defineTable({
  userId: v.string(), ticker: v.string(), addedAt: v.number()
}).index("by_user", ["userId"]),

// Persists per-ticker settings (shares owned + cost basis) entered manually by the user
userStockSettings: defineTable({
  userId: v.string(),
  ticker: v.string(),
  sharesOwned: v.optional(v.number()),   // e.g. 100
  costBasis: v.optional(v.number()),     // e.g. 170.00 — manual entry, $/share
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_ticker", ["userId", "ticker"]),

// Tracks which onboarding/tutorial steps the user has completed
userTutorialState: defineTable({
  userId: v.string(),
  onboardingCompleted: v.boolean(),
  conceptCardsCompleted: v.boolean(),
  seenCoachMarks: v.array(v.string()),  // e.g. ["search_tab", "result_card", "trade_detail"]
  onboardingGoal: v.optional(v.union(
    v.literal("cc"), v.literal("csp"), v.literal("explore")
  )),
  onboardingCapital: v.optional(v.number()),
  updatedAt: v.number(),
}).index("by_user", ["userId"]),

portfolioPositions: defineTable({
  userId: v.string(),
  ticker: v.string(),
  strategy: v.union(
    v.literal("CC"), v.literal("CSP"),
    v.literal("BullPutSpread"), v.literal("IronCondor")
  ),
  // Single-leg (CC/CSP)
  strike: v.optional(v.number()),
  // Spread legs (BullPutSpread: shortStrike + longStrike)
  shortStrike: v.optional(v.number()),
  longStrike: v.optional(v.number()),
  // Iron Condor (4 strikes)
  shortCallStrike: v.optional(v.number()),
  longCallStrike: v.optional(v.number()),
  shortPutStrike: v.optional(v.number()),
  longPutStrike: v.optional(v.number()),

  expiration: v.string(),           // "2026-05-16"
  entryDate: v.number(),            // timestamp ms
  entryPremium: v.number(),         // per-share mid at entry (e.g., 2.50)
  entryUnderlyingPrice: v.number(), // stock price at entry
  quantity: v.number(),             // number of contracts (default 1)

  status: v.union(
    v.literal("open"),
    v.literal("closed"),
    v.literal("expired_worthless"),
    v.literal("assigned")
  ),
  // For CC positions: cost basis of underlying shares at time of trade entry
  // Pre-filled from userStockSettings.costBasis; user can override per-position
  sharesCostBasis: v.optional(v.number()),

  closeDate: v.optional(v.number()),
  closePremium: v.optional(v.number()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_status", ["userId", "status"]),
```

---

## Screen Mockups (ASCII)

### Screen 1 — Stock Search Landing (`/dashboard/trader`)
```
┌──────────────────────────────────────────────────────────────────────┐
│  TRADER INCOME TOOL                                                  │
│                                                                      │
│         Find the best options income for your capital                │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │  Search ticker... (AAPL, TSLA, SPY, NVDA...)             │      │
│   └──────────────────────────────────────────────────────────┘      │
│             or  [Scan All Stocks →]                                  │
│                                                                      │
│   RECENTLY VIEWED                                                    │
│   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐               │
│   │ AAPL │  │ TSLA │  │  SPY │  │ NVDA │  │  QQQ │               │
│   │$185  │  │$248  │  │$499  │  │ $84  │  │$439  │               │
│   └──────┘  └──────┘  └──────┘  └──────┘  └──────┘               │
└──────────────────────────────────────────────────────────────────────┘
```

### Screen 2 — Income Scanner (`/dashboard/trader/scanner`)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ INCOME SCANNER   Scanning 100+ stocks          [Last: 2:34 PM]  [Re-scan]   │
├─────────────────┬────────────────────────────────────────────────────────────┤
│ FILTERS         │  312 trades   Sort: [$/Day ▼]            [Export CSV]      │
│                 ├───────┬────────┬───────┬────────┬───────┬────────┬────────┤
│ Strategy        │TICKER │STRATEGY│STRIKE │EXPIRY  │$/DAY  │ANN %  │CAP REQ │
│  [✓] CSP        ├───────┼────────┼───────┼────────┼───────┼────────┼────────┤
│  [✓] CC         │ TSLA  │  CSP   │ $240  │May 16  │$18.33 │ 62.4% │$24,000 │
│  [✓] Spread     │ NVDA  │  CSP   │  $80  │Apr 25  │$14.10 │ 48.1% │ $8,000 │
│  [ ] Wheel      │ AAPL  │   CC   │ $195  │May 16  │ $9.10 │ 17.9% │$18,500 │
│                 │  AMD  │  CSP   │  $95  │Apr 25  │ $8.40 │ 32.2% │ $9,500 │
│ My Capital      │  SPY  │  CSP   │ $495  │Apr 25  │ $7.95 │ 11.7% │$49,500 │← grayed
│ [$10,000      ] │ GOOGL │   CC   │ $170  │May 16  │ $6.20 │ 22.1% │$16,800 │← grayed
│ ✓ Hide over cap │  NKE  │  CSP   │  $72  │Apr 25  │ $4.90 │ 49.5% │ $7,200 │
│                 │  AMD  │  Sprd  │  $95  │May 16  │ $3.80 │ 41.2% │ $2,300 │
│ DTE Range       │  ·  ·  ·                                                   │
│ [14] – [60]     │                                                             │
│                 │  ← Prev  [1] 2 3 ... 16 →                                 │
│ Min Return      │                                                             │
│ [10%          ] │  Capital Required = strike × 100 (CSP/CC)                  │
│                 │                     spread width × 100 (Spread)            │
│ Risk Level      │                                                             │
│  [✓] Conserv.   │                                                             │
│  [✓] Moderate   │                                                             │
│  [ ] Aggress.   │                                                             │
│                 │                                                             │
│  [Apply]        │                                                             │
└─────────────────┴─────────────────────────────────────────────────────────────┘
```
Capital display rules:
- Row affordable (cap_req ≤ my capital): normal text
- Row unaffordable: grayed out + "Over budget" badge
- "Hide over cap" toggle: removes unaffordable rows entirely

### Screen 3 — Ticker Analysis, CC/CSP Grid (`/dashboard/trader/AAPL`)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Scanner   AAPL  Apple Inc.          I own [100] shares            │
│                                                 Stock value: $18,500         │
│  $185.00   ▼ $142 ─────────●──────── $199 ▲                                │
│            52-week low               52-week high                            │
├──────────────────────────────────────────────────────────────────────────────┤
│  [Covered Calls]  [Cash-Secured Puts]  [The Wheel]  [Put Spread]            │
├────────────────┬────────┬────────┬──────────┬─────────┬─────────┬──────────┤
│                │  $175  │  $180  │  $185◀ATM│  $190   │  $195   │  $200    │
├────────────────┼────────┼────────┼──────────┼─────────┼─────────┼──────────┤
│ 🏆 Apr18  14d  │$12.4/d │ $9.1/d │  $7.2/d  │ $4.3/d●│ $2.1/d  │  $0.9/d │
│                │ 32.4%  │ 23.9%  │  18.9%   │  11.3% │  5.5%   │   2.3%  │
├────────────────┼────────┼────────┼──────────┼─────────┼─────────┼──────────┤
│    Apr25  21d  │ $9.8/d │ $7.3/d │  $5.9/d  │ $3.5/d●│ $1.8/d  │  $0.8/d │
│                │ 25.7%  │ 19.1%  │  15.5%   │   9.2% │  4.7%   │   2.1%  │
├────────────────┼────────┼────────┼──────────┼─────────┼─────────┼──────────┤
│    May16  42d  │ $7.2/d │ $5.6/d │  $4.5/d  │ $2.8/d  │ $1.5/d●│  $0.7/d │
│                │ 18.9%  │ 14.7%  │  11.8%   │   7.3%  │  3.9%  │   1.8%  │
├────────────────┼────────┼────────┼──────────┼─────────┼─────────┼──────────┤
│    Jun20  77d  │ $5.4/d │ $4.2/d │  $3.4/d  │ $2.2/d  │ $1.3/d │  $0.7/d │
│                │ 14.2%  │ 11.0%  │   8.9%   │   5.8%  │  3.4%  │   1.8%  │
└────────────────┴────────┴────────┴──────────┴─────────┴─────────┴──────────┘
                 ● = top-3 cell by annualized return (green ring highlight)
```

### Screen 4 — Trade Detail Drawer (bottom sheet on cell click)
```
┌───────────────────────────────────────────────────────────────────────┐
│                         ▔▔▔▔▔▔▔▔▔▔▔▔▔▔                               │
│  TRADE DETAIL                                               [✕ Close] │
├───────────────────────────────────────────────────────────────────────┤
│  AAPL $190 Covered Call  ·  Expires Apr 18  ·  14 days remaining      │
│                                                                       │
│  If you sell 1 AAPL $190 Call expiring Apr 18...                     │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  Premium collected       $143.00  (mid $1.43)                 │   │
│  │  Daily cash flow           $4.30 / day                        │   │
│  │  Annualized return         11.3%  on $18,500 stock value      │   │
│  │  Settlement date          Apr 18, 2026  (14 days)             │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  RISK SUMMARY                                    [Moderate]           │
│  Your 100 AAPL shares get called away at $190 if AAPL closes above   │
│  $190 at expiration. Effective exit price = $191.43 (+3.5% from now) │
│                                                                       │
│  · If AAPL drops, you keep the $143 but still hold the shares        │
│  · You can close early to lock in partial profits                     │
│  · No earnings before Apr 18                                          │
│                                                                       │
│  [Ask AI about this trade]              [Save to Trade Log]           │
└───────────────────────────────────────────────────────────────────────┘
```

### Screen 5 — Portfolio Simulator (`/dashboard/trader/portfolio`)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  MY PAPER PORTFOLIO             [+ Add Position]    1 / 20 positions used    │
├───────────────┬────────────────────┬───────────────────────────────────────┤
│  OPEN: 3      │  REALIZED: +$1,240 │  EXPIRED WORTHLESS: 1  (+$320)        │
│  OPEN P&L: +$847                   │  All-time premium collected: $2,407   │
├───────────────┴────────────────────┴───────────────────────────────────────┤
│  OPEN POSITIONS                                                              │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  TSLA   CSP $240 put    Expires May 16  (38d left)    [Close] [×]   │  │
│  │  Entry: $4.20/share · $420 total · 1 contract                       │  │
│  │  Current: $2.10   Unrealized P&L: +$210  (+50%)                    │  │
│  │  ████████████░░░░░░░░░░  50% of max profit captured                 │  │
│  │  Stock now: $242 · Strike: $240 · 0.8% OTM ⚠ approaching strike   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  AAPL   CC $195 call    Expires Apr 25  (17d left)    [Close] [×]   │  │
│  │  Entry: $2.10/share · $210 total · 1 contract                       │  │
│  │  Current: $0.85   Unrealized P&L: +$125  (+59.5%)                  │  │
│  │  █████████████░░░░░░░  59.5% of max profit captured                 │  │
│  │  Stock now: $186 · Strike: $195 · 4.8% OTM ✓ comfortable           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  CLOSED POSITIONS                                                            │
│  ┌──────┬──────────┬─────────┬────────────┬────────┬─────────┬──────────┐ │
│  │TICKER│STRATEGY  │EXPIRY   │  ENTRY     │  EXIT  │ STATUS  │  RESULT  │ │
│  ├──────┼──────────┼─────────┼────────────┼────────┼─────────┼──────────┤ │
│  │ NVDA │ CSP $80  │ Apr 17  │ $3.50      │ $0.20  │ Closed  │ +$330 ✓ │ │
│  │  AMD │ Sprd $95 │ Apr 17  │ $1.20      │expired │ Exp.W/L │ +$120 ✓ │ │
│  └──────┴──────────┴─────────┴────────────┴────────┴─────────┴──────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```
**Free-tier overlay (after 1 position):**
- "+ Add Position" button shows lock icon + "Upgrade to Pro to track up to 20 positions"
- Existing 1 position remains fully visible and functional

### Screen 6 — Wheel Calculator tab
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Covered Calls]  [Cash-Secured Puts]  [The Wheel ◀]  [Put Spread]          │
├────────────────────────────────┬───────────────────────────────────────────┤
│  PHASE 1 — SELL PUT            │  PHASE 2 — SELL CALL (if assigned)        │
│                                │                                            │
│  Strike:  [$185 ▼]             │  Strike:  [$190 ▼]                        │
│  Expiry:  [Apr 25 – 21d ▼]     │  Expiry:  [May 16 – 42d ▼]               │
│                                │                                            │
│  Premium: $3.10  ($310 total)  │  Premium: $2.40  ($240 total)             │
│  Daily:   $14.76 / day         │  Daily:   $5.71 / day                     │
│                                │                                            │
│  If assigned: buy 100 AAPL     │  If called: sell at $190                  │
│  at net cost $181.90/share     │  + keep $240 premium                      │
├────────────────────────────────┴───────────────────────────────────────────┤
│  FULL CYCLE SUMMARY                                                         │
│                                                                             │
│  Net cost basis      $185.00 − $3.10  =  $181.90 / share                  │
│  Effective exit      $190.00 + $2.40  =  $192.40 / share                  │
│  Cycle profit        $192.40 − $181.90 = $10.50/share  =  $1,050 total    │
│  Total premium       $310 + $240 = $550                                    │
│  Total DTE           21 + 42 = 63 days                                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  CYCLE ANNUALIZED RETURN:  33.2%  on $18,500 capital               │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ├────── CSP phase (21d) ──────┤──────────── CC phase (42d) ──────────┤  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Scanner Feature Details

### Capital Requirement Logic
```
CC:          capitalRequired = stockPrice × 100      (own 100 shares)
CSP:         capitalRequired = strikePrice × 100     (cash to buy 100 shares)
Put Spread:  capitalRequired = (spreadWidth − netPremium) × 100
```

### Stock Universe (mock data)
~100 major tickers across 4 volatility tiers. Define in `app/lib/mockMarketData.ts`:
```ts
export const STOCK_UNIVERSE: StockUniverseEntry[] = [
  // tier 1 – low vol (IV ~15-20%)
  { ticker: "JNJ", name: "Johnson & Johnson", price: 155, tier: 1 },
  { ticker: "PG",  name: "Procter & Gamble",  price: 162, tier: 1 },
  { ticker: "KO",  name: "Coca-Cola",          price: 63,  tier: 1 },
  // tier 2 – mid vol (IV ~25-30%)
  { ticker: "AAPL", name: "Apple",    price: 185, tier: 2 },
  { ticker: "MSFT", name: "Microsoft", price: 415, tier: 2 },
  // tier 3 – high vol (IV ~45-60%)
  { ticker: "TSLA", name: "Tesla",  price: 248, tier: 3 },
  { ticker: "NVDA", name: "NVIDIA", price: 84,  tier: 3 },
  // tier 4 – index ETFs (IV ~12-18%)
  { ticker: "SPY", name: "S&P 500 ETF", price: 499, tier: 4 },
  // ... ~100 total
]
```

### Scanner UX Behavior
- On page load: scanner runs automatically (Convex action, ~instant with mock data)
- Capital field: live client-side filter (no refetch), rows gray out / hide as user types
- "Hide over cap" toggle: removes unaffordable rows vs just graying them
- Sort columns: $/Day (default), Ann %, Capital Required (ascending = affordable first)
- Pagination: 20 rows per page
- Click any row → navigates to `/dashboard/trader/TICKER` with that strike/expiry pre-selected
- Export CSV: download current filtered results

---

## Grid UX Details

**CC / CSP Grid (`OptionsGrid.tsx`):**
- Rows = expiry dates (DTE shown), Columns = strikes from ~85% to ~120% of current price
- ATM column: subtle `bg-muted/50` background for orientation
- Top 3 cells by annualized return: `ring-2 ring-green-400` highlight
- Best DTE row: trophy icon on left border
- Cells with mid < $0.05: show `—`
- Lazy-load additional expiry chains beyond first 3

**Bull Put Spread Grid (`SpreadGrid.tsx`):**
- Same row structure (expiry dates)
- Columns = short strike prices
- Spread width selector (dropdown: $5 / $10 / $15 / $20 wide)
- Cell shows: net premium/day, annualized return on capital, max loss amount
- Risk clearly stated: "Max loss: $X if stock drops below $Y"

**Wheel Calculator (`WheelCalculator.tsx`):**
- Two-column layout side by side: "Phase 1: Sell Put" | "Phase 2: Sell Call"
- User picks a CSP strike + expiry and a CC strike + expiry from dropdowns
- Summary card: net cost basis, effective exit price, total cycle profit, cycle annualized return
- Timeline bar showing total DTE across both phases

---

## AI Integration

Update chat system prompt in `convex/http.ts`:
```
"You are a plain-English options trading assistant. Explain concepts in cash flow terms.
Avoid Greek letters unless immediately explained in dollar terms. Focus on:
premium earned, daily income, annualized return, and risk scenarios."
```

`TradeDetailDrawer` includes "Ask AI about this trade" button that navigates to `/dashboard/chat` with trade context pre-seeded as the first message.

---

## Monetization Strategy

### Model: Freemium + Broker Affiliate

**Auth gate:** Clerk auth required for all `/dashboard/*` routes (sign up is free).  
**Subscription gate:** Removed from `dashboard/layout.tsx` — Polar gate moved to specific features only.

### Feature Tiers

| Feature | Free (auth only) | Pro (Polar subscription) |
|---|---|---|
| Ticker search | ✓ | ✓ |
| CC / CSP / Spread / Wheel / Iron Condor grid | ✓ | ✓ |
| Scanner — top 5 results (teaser) | ✓ | ✓ |
| Scanner — all results | Upgrade CTA | ✓ |
| CSV export | Upgrade CTA | ✓ |
| "Ask AI about this trade" button | Upgrade CTA | ✓ |
| Portfolio Simulator — 1 position | ✓ | ✓ |
| Portfolio Simulator — up to 20 positions | Upgrade CTA | ✓ |
| Real-time Tradier data (Phase 2) | — | Premium plan only |

### Scanner Teaser UX
- Scanner runs and returns all results from Convex
- **Frontend slices to 5 rows** for free users — remaining rows rendered as blurred/locked
- Below row 5: upgrade CTA card — "Unlock all X trades — upgrade to Pro"
- Gate check: `checkUserSubscriptionStatus` query (already exists in `convex/subscriptions.ts`)

### Affiliate Links (in `TradeDetailDrawer`)
- "Trade this on Tastytrade ↗" — user supplies their affiliate URL
- "Open in IBKR ↗" — user supplies their affiliate URL
- Rendered as secondary buttons in the drawer footer
- No backend required — plain `<a href target="_blank">` links with `rel="noopener noreferrer"`
- Add a `VITE_TASTYTRADE_AFFILIATE_URL` and `VITE_IBKR_AFFILIATE_URL` env var (optional — buttons hidden if unset)

### Files Changed for Monetization
| File | Change |
|---|---|
| `app/routes/dashboard/layout.tsx` | Remove Polar subscription gate; keep Clerk auth gate |
| `app/hooks/useSubscription.ts` | New thin hook: wraps `checkUserSubscriptionStatus` query |
| `app/components/trader/ScannerResultsTable.tsx` | Slice to 5 + blur + upgrade CTA for free users |
| `app/components/trader/TradeDetailDrawer.tsx` | Gate AI + Trade Log buttons; add affiliate CTAs |
| `app/components/trader/UpgradeCTA.tsx` | Reusable upgrade prompt component (links to `/pricing`) |
| `app/routes/dashboard/trader/portfolio.tsx` | Portfolio simulator page |
| `app/components/trader/PortfolioSummaryCard.tsx` | Top stats bar |
| `app/components/trader/PositionCard.tsx` | Open position with P&L progress bar |
| `app/components/trader/AddPositionDrawer.tsx` | Manual add + triggered from TradeDetailDrawer |

---

## Implementation Phases

### Phase 1 — MVP (mock data, all 5 strategies + portfolio simulator)
1. `app/lib/optionsCalculations.ts` — all math functions (CC, CSP, Wheel, BullPutSpread, IronCondor)
2. `app/lib/marketData.ts` + `app/lib/mockMarketData.ts` — data layer with `STOCK_UNIVERSE` (~100 tickers)
3. Schema additions (5 new tables: optionsCache, stockQuoteCache, userWatchlist, portfolioPositions, userStockSettings)
4. `convex/options.ts` + `convex/watchlist.ts` + `convex/scanner.ts` — using mock data provider
5. `convex/portfolio.ts` — position CRUD, limit enforcement, live P&L, trade history query
6. `convex/stockSettings.ts` — per-ticker cost basis + shares owned persistence
7. Stock search + ticker analysis routes (SSR loader)
8. `StockHeader` — price bar + "I own X shares / cost basis $___" inputs; saves to `userStockSettings` on blur
9. `OptionsGrid`, `OptionCell`, `TradeDetailDrawer` (CC + CSP)
10. `CostBasisBadge` — visual marker on CC grid columns above/below cost basis; `UnderwaterPanel` when price < cost basis
11. `SpreadGrid` — Bull Put Spread view
12. `IronCondorGrid` — Iron Condor view
13. `WheelCalculator` — Wheel scenario view
14. **Scanner page** — `ScannerFilters` + `ScannerResultsTable` with capital filter + freemium teaser
15. **Portfolio simulator page** — `PortfolioSummaryCard` + `PositionCard` list + `AddPositionDrawer` + `TradeHistoryTable` (permanent closed/expired log with win rate + all-time premium)
16. Route registration + sidebar nav (Trader, Scanner, Portfolio)
17. **Monetization layer** — remove Polar gate from layout, add `useSubscription` hook, `UpgradeCTA`, portfolio limit enforcement, affiliate links in drawer

### Phase 2 — Real Data + Best Trades
1. `app/lib/tradierMarketData.ts` — Tradier API implementation
2. Swap mock → Tradier in `convex/options.ts` and `convex/scanner.ts`
3. Cache logic (15min TTL during market hours)
4. `BestTradeTable` + `BestTradeFilters` page
5. Lazy-load additional expiry chains
6. Expand `STOCK_UNIVERSE` to full S&P 500 (500 tickers)

### Phase 3 — Polish
1. AI context injection from trade detail drawer
2. Top-3 cell highlighting
3. Mobile layout (horizontal scroll cards)
4. Earnings calendar warning (flag expiries crossing earnings dates)
5. Trade log: save considered trades to Convex per user

---

## Verification

1. `npm run dev` → navigate to `/dashboard/trader`
2. Search "AAPL" → verify mock stock quote loads, expiry dates populate
3. Click CC tab → verify grid renders with daily cash flow + annualized return per cell
4. Click a cell → verify `TradeDetailDrawer` shows plain-English breakdown with correct math
5. Switch to CSP tab → verify annualized return uses `strikePrice * 100` as capital (not stock price)
6. Switch to Put Spread tab → verify max loss = spread width - net premium; annualized return uses `capitalRequired`
7. Switch to Wheel tab → verify cycle return = CC exit price - CSP cost basis
8. Manually verify calculations: e.g., AAPL $190 call, bid $1.80 ask $2.00, 21 DTE, stock at $185
   - mid = $1.90, premium = $190, daily = $9.05/day, ann = ($190 / $18,500) × (365/21) × 100 = 17.8%
9. Navigate to `/dashboard/trader/best-trades` → verify trades sortable by annualized return
10. Verify sidebar has "Trader", "Scanner", and "Portfolio" links
11. **Freemium gate:** Sign in without subscription → ticker grid works, scanner shows 5 rows + upgrade CTA, "Ask AI" shows upgrade prompt
12. **Portfolio free limit:** Add 1 position as free user → works; try to add 2nd → upgrade CTA appears; subscribe → can add up to 20
13. **Portfolio P&L:** Add a CSP position → navigate away and back → confirm P&L re-calculates using same mock data (different from entry premium due to DTE change)
14. **Close position:** Click "Close" on open position, enter close premium → position moves to closed with realized P&L
15. **Iron Condor grid:** Navigate to ticker → IC tab → verify 4-strike display, net premium, upper/lower breakevens
16. **Affiliate links:** Set `VITE_TASTYTRADE_AFFILIATE_URL` → open trade drawer, verify button appears; unset → button hidden
