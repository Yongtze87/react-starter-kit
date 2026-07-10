type Risk = "Conservative" | "Moderate" | "Aggressive";

const STYLES: Record<Risk, string> = {
  Conservative: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  Moderate:     "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  Aggressive:   "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

export function RiskBadge({ risk }: { risk: Risk }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STYLES[risk]}`}>
      {risk}
    </span>
  );
}
