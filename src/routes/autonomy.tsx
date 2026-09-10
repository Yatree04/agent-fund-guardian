import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Shell } from "@/components/Shell";
import { TierBadge, tierLabel } from "@/components/tier-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFund } from "@/lib/fund-store";
import type { Autonomy } from "@/lib/fund-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/autonomy")({
  head: () => ({
    meta: [
      { title: "Agent Autonomy Tiers | Meridian Agent Ops" },
      {
        name: "description",
        content:
          "Set each agent capability to autonomous, human approval required, or prohibited — per agent, per action.",
      },
      { property: "og:title", content: "Agent Autonomy Tiers | Meridian Agent Ops" },
      {
        property: "og:description",
        content: "Granular control of what every fund agent may do alone, with sign-off, or never.",
      },
    ],
  }),
  component: AutonomyPage,
});

const tiers: Autonomy[] = ["autonomous", "approval", "prohibited"];

function AutonomyPage() {
  const { agents, setCapabilityAutonomy } = useFund();

  return (
    <Shell
      title="Agent autonomy"
      subtitle="Every capability sits in one of three tiers. Approval-tier actions pause the pipeline and land in the exception inbox."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {tiers.map((t) => (
          <div key={t} className="rounded-lg border border-border bg-card/40 p-4">
            <TierBadge tier={t} />
            <p className="mt-2 text-xs text-muted-foreground">
              {t === "autonomous"
                ? "Agent acts alone and logs the decision."
                : t === "approval"
                  ? "Agent prepares the action; a human must sign off before it runs."
                  : "Agent may never take this action; attempts are blocked and logged."}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <CardTitle className="text-base">{agent.name}</CardTitle>
              <CardDescription>
                {agent.role} agent · {agent.capabilities.filter((c) => c.autonomy === "autonomous").length}{" "}
                autonomous, {agent.capabilities.filter((c) => c.autonomy === "approval").length} gated,{" "}
                {agent.capabilities.filter((c) => c.autonomy === "prohibited").length} prohibited
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {agent.capabilities.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2.5"
                >
                  <div className="min-w-56 flex-1">
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <div className="flex overflow-hidden rounded-md border border-border">
                    {tiers.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setCapabilityAutonomy(agent.id, c.id, t);
                          toast.success(`${c.label} → ${tierLabel[t]}`, {
                            description: `${agent.name} policy updated and logged.`,
                          });
                        }}
                        className={cn(
                          "px-3 py-1.5 text-xs transition-colors",
                          c.autonomy === t
                            ? t === "autonomous"
                              ? "bg-chart-2/20 text-chart-2"
                              : t === "approval"
                                ? "bg-chart-4/20 text-chart-4"
                                : "bg-destructive/20 text-destructive"
                            : "text-muted-foreground hover:bg-accent",
                        )}
                      >
                        {tierLabel[t]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
