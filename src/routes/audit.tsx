import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Cpu, User } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { useFund } from "@/lib/fund-store";
import type { AuditEntry } from "@/lib/fund-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Decision Audit Trail | Meridian Agent Ops" },
      {
        name: "description",
        content:
          "Immutable record of every agent action and human override, with actor, reasoning and outcome.",
      },
      { property: "og:title", content: "Decision Audit Trail | Meridian Agent Ops" },
      {
        property: "og:description",
        content: "Every agent and human decision, timestamped and attributable.",
      },
    ],
  }),
  component: Audit,
});

const actorIcon = { agent: Bot, human: User, system: Cpu };

const outcomeStyle: Record<AuditEntry["outcome"], string> = {
  executed: "text-chart-2 border-chart-2/40 bg-chart-2/10",
  blocked: "text-destructive border-destructive/40 bg-destructive/10",
  pending: "text-chart-4 border-chart-4/40 bg-chart-4/10",
  logged: "text-muted-foreground border-border bg-secondary",
};

const filters = ["all", "agent", "human", "system"] as const;

function Audit() {
  const { audit } = useFund();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const rows = audit.filter((e) => filter === "all" || e.actorType === filter);

  return (
    <Shell
      title="Audit trail"
      subtitle="Append-only log of agent actions and human decisions, suitable for compliance review."
    >
      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs capitalize transition-colors",
              filter === f ? "border-ring bg-accent" : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {f === "all" ? "All actors" : `${f} decisions`}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {rows.map((e) => {
            const Icon = actorIcon[e.actorType];
            return (
              <div key={e.id} className="flex flex-wrap items-start gap-3 px-4 py-3">
                <span className="mt-0.5 font-mono text-xs text-muted-foreground">{e.at}</span>
                <Icon
                  className={cn(
                    "mt-0.5 size-4",
                    e.actorType === "human" ? "text-chart-4" : e.actorType === "agent" ? "text-chart-2" : "text-muted-foreground",
                  )}
                />
                <div className="min-w-56 flex-1">
                  <p className="text-sm font-medium">{e.action}</p>
                  <p className="text-xs text-muted-foreground">{e.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{e.actor}</span>
                <span className={cn("rounded border px-2 py-0.5 text-[10px] uppercase", outcomeStyle[e.outcome])}>
                  {e.outcome}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{e.id}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </Shell>
  );
}
