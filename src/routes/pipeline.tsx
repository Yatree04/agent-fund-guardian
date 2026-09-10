import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, CircleDot, LineChart, ShieldAlert, Zap } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFund } from "@/lib/fund-store";
import type { AgentRole, PipelineStage } from "@/lib/fund-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Multi-Agent Workflow Pipeline | Meridian Agent Ops" },
      {
        name: "description",
        content:
          "Follow each idea through the Research, Portfolio, Risk and Trading agents, with handoffs and blocks visible at every stage.",
      },
      { property: "og:title", content: "Multi-Agent Workflow Pipeline | Meridian Agent Ops" },
      {
        property: "og:description",
        content: "Research to Portfolio to Risk to Trading — every agent handoff, live.",
      },
    ],
  }),
  component: Pipeline,
});

const roleIcon: Record<AgentRole, typeof Brain> = {
  Research: Brain,
  Portfolio: LineChart,
  Risk: ShieldAlert,
  Trading: Zap,
};

const stateStyle: Record<PipelineStage["state"], string> = {
  done: "border-chart-2/40 bg-chart-2/5",
  active: "border-chart-4/50 bg-chart-4/10",
  blocked: "border-destructive/50 bg-destructive/10",
  queued: "border-border bg-card/30 opacity-70",
};

const stateLabel: Record<PipelineStage["state"], string> = {
  done: "Complete",
  active: "Running",
  blocked: "Blocked",
  queued: "Queued",
};

function Pipeline() {
  const { runs, agents } = useFund();

  return (
    <Shell
      title="Multi-agent pipeline"
      subtitle="Ideas flow Research → Portfolio → Risk → Trading. A stage only advances when the prior agent's output clears policy."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {agents.map((a) => {
          const Icon = roleIcon[a.role];
          return (
            <div key={a.id} className="rounded-lg border border-border bg-card/40 p-4">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-chart-2" />
                <p className="text-sm font-medium">{a.role}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{a.name}</p>
              <p className="mt-3 font-mono text-xs uppercase text-muted-foreground">
                <CircleDot className="mr-1 inline size-3" />
                {a.status}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {runs.map((run) => (
          <Card key={run.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                <span className="font-mono text-xs text-muted-foreground">{run.id}</span>
                {run.thesis}
                <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs">{run.ticker}</span>
              </CardTitle>
              <CardDescription>Started {run.createdAt}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 lg:grid-cols-4">
                {run.stages.map((s) => {
                  const Icon = roleIcon[s.role];
                  return (
                    <div key={s.id} className={cn("rounded-lg border p-3", stateStyle[s.state])}>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                          <Icon className="size-3.5" />
                          {s.role}
                        </span>
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">
                          {stateLabel[s.state]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.detail}</p>
                      <p className="mt-2 border-t border-border pt-2 text-xs">{s.output}</p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                        {s.startedAt}
                        {s.durationMs > 0 && ` · ${Math.round(s.durationMs / 1000)}s`}
                      </p>
                    </div>
                  );
                })}
              </div>
              {run.stages.some((s) => s.state === "blocked" || s.state === "active") && (
                <Link
                  to="/inbox"
                  className="mt-3 inline-block text-xs text-chart-4 hover:underline"
                >
                  Resolve in exception inbox →
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
