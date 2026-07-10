interface Props {
  strike: number;
  costBasis: number | null | undefined;
}

export function CostBasisBadge({ strike, costBasis }: Props) {
  if (!costBasis) return null;
  const diff = strike - costBasis;
  const pct = (diff / costBasis) * 100;

  if (diff > 0) {
    return (
      <span className="text-[10px] text-[#05B169] font-medium leading-none">
        +{pct.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="text-[10px] text-[#DF5F67] font-medium leading-none" title="Loss if called away">
      ⚠ −{Math.abs(pct).toFixed(1)}%
    </span>
  );
}
