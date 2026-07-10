import { Link } from "react-router";
import { Lock } from "lucide-react";

interface UpgradeCTAProps {
  message?: string;
}

// Phase 1 stub — useSubscription always returns "pro", so this never renders.
// In Phase 2, wrap feature gates with this component.
export function UpgradeCTA({ message = "Upgrade to Pro to unlock this feature" }: UpgradeCTAProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-[#F5F8FF] dark:bg-[#13171F] flex items-center justify-center">
        <Lock size={18} className="text-[#0052FF]" />
      </div>
      <p className="font-medium text-sm">{message}</p>
      <Link
        to="/pricing"
        className="bg-[#0052FF] hover:bg-[#0039B3] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
      >
        Upgrade to Pro →
      </Link>
    </div>
  );
}
