// Mock market data provider — deterministic, realistic-looking options data.
// Used by Convex queries. No external API calls.

export interface StockInfo {
  ticker: string;
  name: string;
  price: number;
  tier: 1 | 2 | 3 | 4;
}

// IV by tier (annualized decimal)
const TIER_IV: Record<number, number> = { 1: 0.17, 2: 0.28, 3: 0.52, 4: 0.15 };

export const STOCK_UNIVERSE: StockInfo[] = [
  // Tier 1 — low vol (IV ~17%)
  { ticker: "JNJ",  name: "Johnson & Johnson",   price: 155, tier: 1 },
  { ticker: "PG",   name: "Procter & Gamble",    price: 162, tier: 1 },
  { ticker: "KO",   name: "Coca-Cola",            price: 63,  tier: 1 },
  { ticker: "T",    name: "AT&T",                 price: 22,  tier: 1 },
  { ticker: "VZ",   name: "Verizon",              price: 40,  tier: 1 },
  { ticker: "MRK",  name: "Merck",                price: 88,  tier: 1 },
  { ticker: "ABT",  name: "Abbott Laboratories",  price: 128, tier: 1 },
  { ticker: "MMM",  name: "3M Company",           price: 110, tier: 1 },
  { ticker: "HD",   name: "Home Depot",           price: 350, tier: 1 },
  { ticker: "WMT",  name: "Walmart",              price: 68,  tier: 1 },
  { ticker: "TGT",  name: "Target",               price: 148, tier: 1 },
  { ticker: "CVS",  name: "CVS Health",           price: 57,  tier: 1 },
  { ticker: "UPS",  name: "United Parcel Service",price: 132, tier: 1 },
  { ticker: "GIS",  name: "General Mills",        price: 68,  tier: 1 },
  { ticker: "CL",   name: "Colgate-Palmolive",    price: 95,  tier: 1 },
  { ticker: "XOM",  name: "ExxonMobil",           price: 118, tier: 1 },
  { ticker: "CVX",  name: "Chevron",              price: 158, tier: 1 },
  { ticker: "SO",   name: "Southern Company",     price: 88,  tier: 1 },
  { ticker: "D",    name: "Dominion Energy",      price: 52,  tier: 1 },
  { ticker: "DUK",  name: "Duke Energy",          price: 115, tier: 1 },

  // Tier 2 — mid vol (IV ~28%)
  { ticker: "AAPL", name: "Apple",               price: 185, tier: 2 },
  { ticker: "MSFT", name: "Microsoft",            price: 415, tier: 2 },
  { ticker: "GOOGL",name: "Alphabet",             price: 172, tier: 2 },
  { ticker: "AMZN", name: "Amazon",               price: 192, tier: 2 },
  { ticker: "JPM",  name: "JPMorgan Chase",       price: 215, tier: 2 },
  { ticker: "BAC",  name: "Bank of America",      price: 42,  tier: 2 },
  { ticker: "WFC",  name: "Wells Fargo",          price: 68,  tier: 2 },
  { ticker: "GS",   name: "Goldman Sachs",        price: 490, tier: 2 },
  { ticker: "MS",   name: "Morgan Stanley",       price: 115, tier: 2 },
  { ticker: "V",    name: "Visa",                 price: 278, tier: 2 },
  { ticker: "MA",   name: "Mastercard",           price: 455, tier: 2 },
  { ticker: "UNH",  name: "UnitedHealth Group",   price: 480, tier: 2 },
  { ticker: "LLY",  name: "Eli Lilly",            price: 795, tier: 2 },
  { ticker: "ABBV", name: "AbbVie",               price: 175, tier: 2 },
  { ticker: "PFE",  name: "Pfizer",               price: 28,  tier: 2 },
  { ticker: "DIS",  name: "Walt Disney",          price: 92,  tier: 2 },
  { ticker: "SBUX", name: "Starbucks",            price: 78,  tier: 2 },
  { ticker: "MCD",  name: "McDonald's",           price: 305, tier: 2 },
  { ticker: "NKE",  name: "Nike",                 price: 72,  tier: 2 },
  { ticker: "LOW",  name: "Lowe's",               price: 228, tier: 2 },
  { ticker: "CSCO", name: "Cisco Systems",        price: 58,  tier: 2 },
  { ticker: "INTC", name: "Intel",                price: 21,  tier: 2 },
  { ticker: "IBM",  name: "IBM",                  price: 178, tier: 2 },
  { ticker: "ORCL", name: "Oracle",               price: 162, tier: 2 },
  { ticker: "CRM",  name: "Salesforce",           price: 295, tier: 2 },
  { ticker: "NOW",  name: "ServiceNow",           price: 870, tier: 2 },
  { ticker: "ADBE", name: "Adobe",                price: 428, tier: 2 },
  { ticker: "QCOM", name: "Qualcomm",             price: 155, tier: 2 },
  { ticker: "TXN",  name: "Texas Instruments",    price: 195, tier: 2 },

  // Tier 3 — high vol (IV ~52%)
  { ticker: "TSLA", name: "Tesla",                price: 248, tier: 3 },
  { ticker: "NVDA", name: "NVIDIA",               price: 88,  tier: 3 },
  { ticker: "AMD",  name: "Advanced Micro Devices",price: 168, tier: 3 },
  { ticker: "META", name: "Meta Platforms",       price: 560, tier: 3 },
  { ticker: "NFLX", name: "Netflix",              price: 685, tier: 3 },
  { ticker: "SHOP", name: "Shopify",              price: 88,  tier: 3 },
  { ticker: "SNAP", name: "Snap",                 price: 12,  tier: 3 },
  { ticker: "UBER", name: "Uber Technologies",    price: 72,  tier: 3 },
  { ticker: "COIN", name: "Coinbase",             price: 235, tier: 3 },
  { ticker: "SQ",   name: "Block",                price: 78,  tier: 3 },
  { ticker: "PLTR", name: "Palantir",             price: 25,  tier: 3 },
  { ticker: "RBLX", name: "Roblox",               price: 38,  tier: 3 },
  { ticker: "HOOD", name: "Robinhood Markets",    price: 18,  tier: 3 },
  { ticker: "RIVN", name: "Rivian Automotive",    price: 12,  tier: 3 },
  { ticker: "MARA", name: "Marathon Digital",     price: 22,  tier: 3 },
  { ticker: "RIOT", name: "Riot Platforms",       price: 8,   tier: 3 },
  { ticker: "SOFI", name: "SoFi Technologies",    price: 10,  tier: 3 },
  { ticker: "UPST", name: "Upstart Holdings",     price: 55,  tier: 3 },
  { ticker: "SMCI", name: "Super Micro Computer", price: 42,  tier: 3 },
  { ticker: "ARM",  name: "ARM Holdings",         price: 118, tier: 3 },

  // Tier 4 — index ETFs (IV ~15%)
  { ticker: "SPY",  name: "S&P 500 ETF",          price: 535, tier: 4 },
  { ticker: "QQQ",  name: "Nasdaq 100 ETF",       price: 448, tier: 4 },
  { ticker: "IWM",  name: "Russell 2000 ETF",     price: 218, tier: 4 },
  { ticker: "GLD",  name: "Gold ETF",             price: 218, tier: 4 },
  { ticker: "SLV",  name: "Silver ETF",           price: 27,  tier: 4 },
  { ticker: "TLT",  name: "20yr Treasury ETF",    price: 87,  tier: 4 },
  { ticker: "EEM",  name: "Emerging Markets ETF", price: 43,  tier: 4 },
  { ticker: "DIA",  name: "Dow Jones ETF",        price: 430, tier: 4 },
  { ticker: "VTI",  name: "Total Market ETF",     price: 262, tier: 4 },
  { ticker: "XLF",  name: "Financials Sector ETF",price: 42,  tier: 4 },
  { ticker: "XLK",  name: "Technology Sector ETF",price: 218, tier: 4 },
  { ticker: "XLE",  name: "Energy Sector ETF",    price: 91,  tier: 4 },
  { ticker: "XLV",  name: "Health Care Sector ETF",price: 145, tier: 4 },
  { ticker: "ARKK", name: "ARK Innovation ETF",   price: 52,  tier: 4 },
];

// Find the 3rd Friday of a given year+month (0-indexed month)
function getThirdFriday(year: number, month: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstFriday = ((5 - firstDay.getDay() + 7) % 7) + 1;
  return new Date(year, month, firstFriday + 14);
}

// Generate next N monthly expiration dates after a reference date
export function generateExpirationDates(fromDate: Date, count = 6): string[] {
  const dates: string[] = [];
  let year = fromDate.getFullYear();
  let month = fromDate.getMonth();

  while (dates.length < count) {
    const friday = getThirdFriday(year, month);
    if (friday > fromDate) {
      const mm = String(friday.getMonth() + 1).padStart(2, "0");
      const dd = String(friday.getDate()).padStart(2, "0");
      dates.push(`${friday.getFullYear()}-${mm}-${dd}`);
    }
    month++;
    if (month > 11) { month = 0; year++; }
  }
  return dates;
}

// Strike step based on price
function getStrikeStep(price: number): number {
  if (price < 20) return 0.5;
  if (price < 50) return 1;
  if (price < 100) return 2;
  if (price < 200) return 5;
  if (price < 500) return 10;
  return 25;
}

// OTM discount — steeper as we go further OTM
function getOTMDiscount(otmPercent: number): number {
  if (otmPercent <= 0) return 1.0;
  if (otmPercent <= 2.5) return 1.0 - (otmPercent / 2.5) * 0.5;  // 1.0 → 0.5
  if (otmPercent <= 5)   return 0.5 - ((otmPercent - 2.5) / 2.5) * 0.35; // 0.5 → 0.15
  if (otmPercent <= 10)  return 0.15 - ((otmPercent - 5) / 5) * 0.12;    // 0.15 → 0.03
  return 0.03;
}

function calcDTE(expiration: string, today: Date): number {
  const exp = new Date(expiration + "T00:00:00");
  return Math.max(1, Math.ceil((exp.getTime() - today.getTime()) / 86400000));
}

export function generateStrikes(price: number): number[] {
  const step = getStrikeStep(price);
  const strikes: number[] = [];
  // From 80% to 125% of price, rounded to nearest step
  const low = Math.round(price * 0.80 / step) * step;
  const high = Math.round(price * 1.25 / step) * step;
  for (let s = low; s <= high; s = Math.round((s + step) * 1000) / 1000) {
    strikes.push(s);
  }
  return strikes;
}

interface MockOptionContract {
  strike: number;
  expiration: string;
  optionType: "call" | "put";
  bid: number;
  ask: number;
  mid: number;
  volume: number;
  openInterest: number;
}

// Generate a full options chain for a ticker/expiry
export function generateOptionsChain(
  price: number,
  tier: number,
  expiration: string,
  today: Date
): MockOptionContract[] {
  const iv = TIER_IV[tier] ?? 0.25;
  const dte = calcDTE(expiration, today);
  const dteFraction = dte / 365;
  const strikes = generateStrikes(price);
  const contracts: MockOptionContract[] = [];

  for (const strike of strikes) {
    // Calls — OTM when strike > price
    const callOTM = Math.max(0, (strike - price) / price) * 100;
    const callDiscount = getOTMDiscount(callOTM);
    const callTheo = price * iv * Math.sqrt(dteFraction) * callDiscount;
    // Adds tiny pseudorandom spread variation using deterministic hash
    const seedC = (strike * 1000 + dte * 7 + price * 3) % 17;
    const callBid = Math.max(0.01, callTheo * (0.90 + seedC * 0.005));
    const callAsk = callTheo * (1.08 + ((seedC * 3) % 7) * 0.003);
    contracts.push({
      strike,
      expiration,
      optionType: "call",
      bid: parseFloat(callBid.toFixed(2)),
      ask: parseFloat(callAsk.toFixed(2)),
      mid: parseFloat(((callBid + callAsk) / 2).toFixed(2)),
      volume: Math.round(100 + (seedC * 73) % 2000),
      openInterest: Math.round(500 + (seedC * 137) % 5000),
    });

    // Puts — OTM when strike < price
    const putOTM = Math.max(0, (price - strike) / price) * 100;
    const putDiscount = getOTMDiscount(putOTM);
    const putTheo = price * iv * Math.sqrt(dteFraction) * putDiscount;
    const seedP = (strike * 1000 + dte * 11 + price * 5) % 19;
    const putBid = Math.max(0.01, putTheo * (0.90 + seedP * 0.004));
    const putAsk = putTheo * (1.08 + ((seedP * 3) % 7) * 0.004);
    contracts.push({
      strike,
      expiration,
      optionType: "put",
      bid: parseFloat(putBid.toFixed(2)),
      ask: parseFloat(putAsk.toFixed(2)),
      mid: parseFloat(((putBid + putAsk) / 2).toFixed(2)),
      volume: Math.round(100 + (seedP * 61) % 2000),
      openInterest: Math.round(500 + (seedP * 107) % 5000),
    });
  }
  return contracts;
}

export function getStockInfo(ticker: string): StockInfo | undefined {
  return STOCK_UNIVERSE.find((s) => s.ticker === ticker.toUpperCase());
}

export function mockGetStockQuote(ticker: string, today: Date) {
  const info = getStockInfo(ticker);
  if (!info) return null;
  // 52-wk range: low ~20% below, high ~25% above (tier-adjusted)
  const volatility = TIER_IV[info.tier] ?? 0.25;
  return {
    ticker: info.ticker,
    name: info.name,
    price: info.price,
    weekHigh52: parseFloat((info.price * (1 + volatility * 0.8)).toFixed(2)),
    weekLow52: parseFloat((info.price * (1 - volatility * 0.65)).toFixed(2)),
  };
}

export function mockGetOptionsChain(ticker: string, expiration: string, today: Date) {
  const info = getStockInfo(ticker);
  if (!info) return [];
  return generateOptionsChain(info.price, info.tier, expiration, today);
}

export function mockGetExpirationDates(ticker: string, today: Date): string[] {
  const info = getStockInfo(ticker);
  if (!info) return [];
  return generateExpirationDates(today, 6);
}

export function mockSearchTickers(query: string): Array<{ ticker: string; name: string }> {
  const q = query.toUpperCase();
  return STOCK_UNIVERSE.filter(
    (s) => s.ticker.startsWith(q) || s.name.toUpperCase().includes(q)
  )
    .slice(0, 10)
    .map((s) => ({ ticker: s.ticker, name: s.name }));
}
