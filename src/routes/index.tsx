import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, ShieldCheck } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Shell } from "@/components/Shell";
import { TierBadge } from "@/components/tier-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { navHistory, currency } from "@/lib/fund-data";
import { useFund } from "@/lib/fund-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fund Operations Console | Meridian Agent Ops" },
      {
        name: "description",
        content:
          "Live monitoring of an AI-agent-operated investment fund: NAV, risk limits, agent activity and open exceptions.",
      },
      { property: "og:title", content: "Fund Operations Console | Meridian Agent Ops" },
      {
        property: "og:description",
        content: "Live fund metrics, agent workflow status and human oversight in one console.",
      },
    ],
  }),
  component: Operations,
});

const statusColor: Record<string, string> = {
  running: "text-chart-2",
  waiting: "text-chart-4",
  idle: "text-muted-foreground",
  halted: "text-destructive",
};

function Operations() {
  const { fund, agents, exceptions, audit } = useFund();
  const open = exceptions.filter((e) => e.status === "open");

  const metrics = [
    { label: "Net asset value", value: currency(fund.aum), sub: "+0.94% today" },
    { label: "Gross leverage", value: "1.62x", sub: `limit ${fund.limits.maxGrossLeverage}x` },
    { label: "Daily VaR", value: "2.11%", sub: `limit ${fund.limits.dailyVarPct}%` },
    { label: "Cash", value: "3.4%", sub: `floor ${fund.limits.minCashPct}%` },
  ];

  const utilisation = [
    { label: "Largest position (ASML)", current: 4.1, limit: fund.limits.maxPositionPct, unit: "%" },
    { label: "Sector exposure (Tech)", current: 21.4, limit: fund.limits.maxSectorPct, unit: "%" },
    { label: "Drawdown from peak", current: 2.8, limit: fund.limits.maxDrawdownPct, unit: "%" },
    { label: "Daily VaR", current: 2.11, limit: fund.limits.dailyVarPct, unit: "%" },
  ];

  return (
    <Shell
      title="Operations monitor"
      subtitle="Real-time fund metrics and live agent activity, refreshed continuously from the agent bus."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</p>
              <p className="mt-2 font-mono text-2xl font-semibold">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {open.length > 0 && (
        <Link
          to="/inbox"
          className="mt-4 flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm transition-colors hover:bg-destructive/15"
        >
          <AlertTriangle className="size-4 text-destructive" />
          <span className="font-medium">
            {open.length} exception{open.length > 1 ? "s" : ""} awaiting human review
          </span>
          <span className="text-muted-foreground">— highest: {open[0]?.title}</span>
          <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
        </Link>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">NAV vs. benchmark (intraday, rebased)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={navHistory}>
                <defs>
                  <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis domain={["dataMin - 0.1", "dataMax + 0.1"]} stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="nav" stroke="var(--color-chart-2)" fill="url(#navFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="bench" stroke="var(--color-muted-foreground)" fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk limit utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {utilisation.map((u) => {
              const pct = Math.min(100, (u.current / u.limit) * 100);
              return (
                <div key={u.label}>
                  <div className="mb-1 flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground">{u.label}</span>
                    <span className="font-mono">
                      {u.current}
                      {u.unit} / {u.limit}
                      {u.unit}
                    </span>
                  </div>
                  <Progress value={pct} className={cn(pct > 90 && "[&>div]:bg-destructive")} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Agent operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agents.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/40 px-3 py-3"
              >
                <div className="min-w-40">
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.role} agent · {a.model}
                  </p>
                </div>
                <span className={cn("font-mono text-xs uppercase", statusColor[a.status])}>
                  ● {a.status}
                </span>
                <span className="text-xs text-muted-foreground">heartbeat {a.heartbeat}</span>
                <div className="ml-auto flex items-center gap-4 text-right">
                  <div>
                    <p className="font-mono text-sm">{a.tasksToday}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">tasks today</p>
                  </div>
                  <div>
                    <p className="font-mono text-sm">{a.successRate}%</p>
                    <p className="text-[10px] uppercase text-muted-foreground">clean runs</p>
                  </div>
                  <TierBadge
                    tier={
                      a.capabilities.some((c) => c.autonomy === "approval") ? "approval" : "autonomous"
                    }
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-chart-2" /> Latest decisions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {audit.slice(0, 6).map((e) => (
              <div key={e.id} className="border-l-2 border-border pl-3">
                <p className="text-xs font-medium">{e.action}</p>
                <p className="text-xs text-muted-foreground">
                  {e.at} · {e.actor}
                </p>
              </div>
            ))}
            <Link to="/audit" className="inline-flex items-center gap-1 text-xs text-chart-2 hover:underline">
              View full audit trail <ArrowUpRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Portfolio VaR trend</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={navHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis domain={[1.5, 2.5]} stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="var" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Shell>
  );
}
