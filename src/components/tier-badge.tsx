import { cn } from "@/lib/utils";
import type { Autonomy } from "@/lib/fund-data";

export const tierLabel: Record<Autonomy, string> = {
  autonomous: "Autonomous",
  approval: "Human approval",
  prohibited: "Prohibited",
};

export function TierBadge({ tier, className }: { tier: Autonomy; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tier === "autonomous" && "border-chart-2/40 bg-chart-2/10 text-chart-2",
        tier === "approval" && "border-chart-4/40 bg-chart-4/10 text-chart-4",
        tier === "prohibited" && "border-destructive/40 bg-destructive/10 text-destructive",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {tierLabel[tier]}
    </span>
  );
}
