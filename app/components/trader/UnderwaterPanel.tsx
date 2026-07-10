interface Props {
  stockPrice: number;
  costBasis: number;
  sharesOwned: number;
}

export function UnderwaterPanel({ stockPrice, costBasis, sharesOwned }: Props) {
  const unrealizedLoss = (stockPrice - costBasis) * sharesOwned;
  const pct = ((stockPrice - costBasis) / costBasis) * 100;

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="text-sm">
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            Stock is below your cost basis
          </p>
          <p className="text-amber-700 dark:text-amber-400 mt-1">
            Current unrealized: <span className="tabular-nums font-medium text-[#DF5F67]">
              ${unrealizedLoss.toFixed(0)} ({pct.toFixed(1)}%)
            </span>
          </p>
          <p className="text-amber-700 dark:text-amber-400 mt-1">
            Selling a covered call won't recover losses — it only adds premium income.
            If called away at the strike, you'll realize the loss on your shares.
          </p>
        </div>
      </div>
    </div>
  );
}
