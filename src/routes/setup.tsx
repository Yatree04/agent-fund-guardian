import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFund } from "@/lib/fund-store";
import type { RiskLimits } from "@/lib/fund-data";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Fund Setup & Risk Limits | Meridian Agent Ops" },
      {
        name: "description",
        content: "Define the fund mandate, strategy and the hard risk limits every AI agent must respect.",
      },
      { property: "og:title", content: "Fund Setup & Risk Limits | Meridian Agent Ops" },
      {
        property: "og:description",
        content: "Mandate, strategy and committee risk limits enforced across the agent workflow.",
      },
    ],
  }),
  component: Setup,
});

const limitFields: { key: keyof RiskLimits; label: string; hint: string; unit: string }[] = [
  { key: "maxPositionPct", label: "Max single position", hint: "Share of NAV in one issuer", unit: "%" },
  { key: "maxSectorPct", label: "Max sector exposure", hint: "Share of NAV in one GICS sector", unit: "%" },
  { key: "maxDrawdownPct", label: "Max drawdown", hint: "Peak-to-trough before trading halts", unit: "%" },
  { key: "maxGrossLeverage", label: "Max gross leverage", hint: "Long + short notional / NAV", unit: "x" },
  { key: "dailyVarPct", label: "Daily VaR ceiling", hint: "99% one-day value at risk", unit: "%" },
  { key: "minCashPct", label: "Minimum cash", hint: "Liquidity floor held at all times", unit: "%" },
];

function Setup() {
  const { fund, updateFund, updateLimits } = useFund();
  const [draft, setDraft] = useState(fund);

  return (
    <Shell
      title="Fund setup"
      subtitle="The mandate and limits below are the contract every agent is bound by. Changes are versioned in the audit trail."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mandate & strategy</CardTitle>
            <CardDescription>What the fund is allowed to pursue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Fund name</Label>
              <Input
                id="name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mandate">Mandate</Label>
              <Input
                id="mandate"
                value={draft.mandate}
                onChange={(e) => setDraft({ ...draft, mandate: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bench">Benchmark</Label>
                <Input
                  id="bench"
                  value={draft.benchmark}
                  onChange={(e) => setDraft({ ...draft, benchmark: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ccy">Currency</Label>
                <Input
                  id="ccy"
                  value={draft.baseCurrency}
                  onChange={(e) => setDraft({ ...draft, baseCurrency: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aum">Assets under management ({draft.baseCurrency})</Label>
              <Input
                id="aum"
                type="number"
                value={draft.aum}
                onChange={(e) => setDraft({ ...draft, aum: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy brief given to the agents</Label>
              <Textarea
                id="strategy"
                rows={6}
                value={draft.strategy}
                onChange={(e) => setDraft({ ...draft, strategy: e.target.value })}
              />
            </div>
            <Button
              onClick={() => {
                const { limits: _limits, ...rest } = draft;
                updateFund(rest);
                toast.success("Mandate updated", { description: "All agents reloaded the strategy brief." });
              }}
            >
              Save mandate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk limits</CardTitle>
            <CardDescription>
              Hard constraints. The Risk agent blocks or escalates any proposal that breaches them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {limitFields.map((f) => (
              <div key={f.key} className="grid grid-cols-[1fr_7rem] items-center gap-3">
                <div>
                  <Label htmlFor={f.key}>{f.label}</Label>
                  <p className="text-xs text-muted-foreground">{f.hint}</p>
                </div>
                <div className="relative">
                  <Input
                    id={f.key}
                    type="number"
                    step="0.1"
                    className="pr-7 font-mono"
                    value={draft.limits[f.key]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        limits: { ...draft.limits, [f.key]: Number(e.target.value) },
                      })
                    }
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {f.unit}
                  </span>
                </div>
              </div>
            ))}
            <Button
              onClick={() => {
                updateLimits(draft.limits);
                toast.success("Risk limits published", {
                  description: "New limit set is now enforced on every pipeline run.",
                });
              }}
            >
              Publish limits
            </Button>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
