// Pure options math — no React, no side effects. Used by WheelCalculator and any local computation.

export function calcMidPremium(bid: number, ask: number): number {
  return (bid + ask) / 2;
}

export function calcDTE(expiration: string, today: Date = new Date()): number {
  const exp = new Date(expiration + "T00:00:00");
  const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

export function calcDailyCashFlow(midPremium: number, dte: number): number {
  return (midPremium * 100) / dte;
}

export function calcAnnualizedReturnCC(midPremium: number, stockPrice: number, dte: number): number {
  return ((midPremium * 100) / (stockPrice * 100)) * (365 / dte) * 100;
}

export function calcAnnualizedReturnCSP(midPremium: number, strike: number, dte: number): number {
  return ((midPremium * 100) / (strike * 100)) * (365 / dte) * 100;
}

export function calcBreakEvenCC(strike: number, midPremium: number): number {
  return strike + midPremium;
}

export function calcBreakEvenCSP(strike: number, midPremium: number): number {
  return strike - midPremium;
}

export function calcOTMPercent(strike: number, stockPrice: number): number {
  return (Math.abs(strike - stockPrice) / stockPrice) * 100;
}

export function getRiskCategory(otmPercent: number): "Conservative" | "Moderate" | "Aggressive" {
  if (otmPercent >= 10) return "Conservative";
  if (otmPercent >= 5) return "Moderate";
  return "Aggressive";
}

// Bull Put Spread
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
  const maxLoss = spreadWidth * 100 - netPremiumDollars;
  const annualizedReturn = capitalRequired > 0 ? (netPremiumDollars / capitalRequired) * (365 / dte) * 100 : 0;
  const breakEven = shortStrike - netPremium;
  return { netPremium, netPremiumDollars, capitalRequired, maxLoss, annualizedReturn, breakEven };
}

// The Wheel — cycle summary
export function calcWheelCycle(
  cspStrike: number,
  cspMidPremium: number,
  ccStrike: number,
  ccMidPremium: number,
  totalDTE: number
) {
  const netCostBasis = cspStrike - cspMidPremium;
  const effectiveExitPrice = ccStrike + ccMidPremium;
  const totalCycleProfit = (effectiveExitPrice - netCostBasis) * 100;
  const totalPremium = (cspMidPremium + ccMidPremium) * 100;
  const cycleAnnualizedReturn = (totalCycleProfit / (cspStrike * 100)) * (365 / totalDTE) * 100;
  return { netCostBasis, effectiveExitPrice, totalCycleProfit, totalPremium, cycleAnnualizedReturn };
}

// Iron Condor (included for Phase 2 readiness)
export function calcIronCondor(
  shortPutMid: number,
  longPutMid: number,
  shortCallMid: number,
  longCallMid: number,
  shortPutStrike: number,
  longPutStrike: number,
  shortCallStrike: number,
  longCallStrike: number,
  dte: number
) {
  const netPremium = (shortPutMid + shortCallMid) - (longPutMid + longCallMid);
  const netPremiumDollars = netPremium * 100;
  const putSpreadWidth = shortPutStrike - longPutStrike;
  const callSpreadWidth = longCallStrike - shortCallStrike;
  const capitalRequired = Math.max(putSpreadWidth, callSpreadWidth) * 100 - netPremiumDollars;
  const annualizedReturn = capitalRequired > 0 ? (netPremiumDollars / capitalRequired) * (365 / dte) * 100 : 0;
  const upperBreakEven = shortCallStrike + netPremium;
  const lowerBreakEven = shortPutStrike - netPremium;
  return { netPremium, netPremiumDollars, capitalRequired, annualizedReturn, upperBreakEven, lowerBreakEven };
}
