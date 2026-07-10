// Types for market data — shared across frontend components.
// Convex queries return data conforming to these shapes.

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  weekHigh52: number;
  weekLow52: number;
}

export interface OptionContract {
  strike: number;
  expiration: string; // "YYYY-MM-DD"
  optionType: "call" | "put";
  bid: number;
  ask: number;
  mid: number;
  volume: number;
  openInterest: number;
}

export interface ComputedOption extends OptionContract {
  premiumDollars: number;
  dailyCashFlow: number;
  annualizedReturn: number;
  dte: number;
  otmPercent: number;
  riskCategory: "Conservative" | "Moderate" | "Aggressive";
  breakEven: number;
}

export interface ScanResult {
  ticker: string;
  name: string;
  price: number;
  strategy: "CC" | "CSP" | "BullPutSpread";
  strike: number;
  shortStrike?: number;
  longStrike?: number;
  expiration: string;
  dte: number;
  dailyCashFlow: number;
  annReturn: number;
  capitalRequired: number;
  riskCategory: "Conservative" | "Moderate" | "Aggressive";
  netPremium?: number;
  breakEven?: number;
}
