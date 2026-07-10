// Options math used by Convex queries (scanner, options chain enrichment).

export function calcDTE(expiration: string, today: Date): number {
  const exp = new Date(expiration + "T00:00:00");
  return Math.max(1, Math.ceil((exp.getTime() - today.getTime()) / 86400000));
}

export function calcMid(bid: number, ask: number): number {
  return (bid + ask) / 2;
}

export function calcDailyCashFlow(mid: number, dte: number): number {
  return (mid * 100) / dte;
}

export function calcAnnReturnCC(mid: number, stockPrice: number, dte: number): number {
  return ((mid * 100) / (stockPrice * 100)) * (365 / dte) * 100;
}

export function calcAnnReturnCSP(mid: number, strike: number, dte: number): number {
  return ((mid * 100) / (strike * 100)) * (365 / dte) * 100;
}

export function calcOTMPercent(strike: number, price: number): number {
  return (Math.abs(strike - price) / price) * 100;
}

export function getRiskCategory(otmPercent: number): "Conservative" | "Moderate" | "Aggressive" {
  if (otmPercent >= 10) return "Conservative";
  if (otmPercent >= 5) return "Moderate";
  return "Aggressive";
}

export function calcBullPutSpread(
  shortPutMid: number,
  longPutMid: number,
  shortStrike: number,
  longStrike: number,
  dte: number
) {
  const netPremium = shortPutMid - longPutMid;
  const netPremiumDollars = netPremium * 100;
  const spreadWidth = shortStrike - longStrike;
  const capitalRequired = (spreadWidth - netPremium) * 100;
  const annReturn = capitalRequired > 0 ? (netPremiumDollars / capitalRequired) * (365 / dte) * 100 : 0;
  const dailyCashFlow = capitalRequired > 0 ? netPremiumDollars / dte : 0;
  return { netPremium, netPremiumDollars, capitalRequired, annReturn, dailyCashFlow };
}
