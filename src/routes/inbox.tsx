import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, PencilLine, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { currency, type ExceptionItem } from "@/lib/fund-data";
import { useFund } from "@/lib/fund-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Exception Triage Inbox | Meridian Agent Ops" },
      {
        name: "description",
        content:
          "Review agent escalations with full reasoning, evidence and limit checks, then approve, modify or reject.",
      },
      { property: "og:title", content: "Exception Triage Inbox | Meridian Agent Ops" },
      {
        property: "og:description",
        content: "Explainable agent escalations with one-click human override.",
      },
    ],
  }),
  component: InboxPage,
});

const severityStyle: Record<ExceptionItem["severity"], string> = {
  critical: "border-destructive/50 text-destructive bg-destructive/10",
  high: "border-chart-4/50 text-chart-4 bg-chart-4/10",
  medium: "border-border text-muted-foreground bg-secondary",
};

function InboxPage() {
  const { exceptions, resolveException } = useFund();
  const [selectedId, setSelectedId] = useState(exceptions[0]?.id ?? "");
  const [note, setNote] = useState("");
  const selected = exceptions.find((e) => e.id === selectedId) ?? exceptions[0];

  const decide = (decision: "approved" | "rejected" | "modified") => {
    if (!selected) return;
    const text =
      note.trim() ||
      (decision === "approved"
        ? "Approved as proposed."
        : decision === "rejected"
          ? "Rejected; agent proposal not executed."
          : "Approved with modification.");
    resolveException(selected.id, decision, text);
    setNote("");
    toast.success(`${selected.id} ${decision}`, { description: text });
  };

  return (
    <Shell
      title="Exception inbox"
      subtitle="Everything an agent could not do alone lands here, with the reasoning and evidence behind it."
    >
      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-2">
          {exceptions.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setSelectedId(e.id)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                e.id === selected?.id ? "border-ring bg-accent" : "border-border",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{e.id}</span>
                <span className={cn("rounded border px-1.5 py-0.5 text-[10px] uppercase", severityStyle[e.severity])}>
                  {e.severity}
                </span>
                {e.status !== "open" && (
                  <span className="ml-auto text-[10px] uppercase text-muted-foreground">{e.status}</span>
                )}
              </div>
              <p className="mt-1.5 text-sm font-medium leading-snug">{e.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {e.raisedBy} agent · {e.ticker} · {currency(e.notional)} · {e.createdAt}
              </p>
            </button>
          ))}
        </div>

        {selected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{selected.title}</CardTitle>
              <CardDescription>
                Raised by the {selected.raisedBy} agent at {selected.createdAt} · confidence{" "}
                {(selected.confidence * 100).toFixed(0)}% · notional {currency(selected.notional)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Why this was escalated
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed">{selected.reason}</p>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Agent proposal
                </h3>
                <p className="mt-1.5 rounded-md border border-chart-4/40 bg-chart-4/10 px-3 py-2 text-sm">
                  {selected.proposal}
                </p>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Supporting evidence
                  </h3>
                  <dl className="mt-2 space-y-1.5">
                    {selected.evidence.map((ev) => (
                      <div key={ev.label} className="flex justify-between gap-3 text-xs">
                        <dt className="text-muted-foreground">{ev.label}</dt>
                        <dd className="text-right font-mono">{ev.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Limit checks
                  </h3>
                  <dl className="mt-2 space-y-1.5">
                    {selected.breaches.map((b) => (
                      <div key={b.limit} className="flex items-center justify-between gap-3 text-xs">
                        <dt className="text-muted-foreground">{b.limit}</dt>
                        <dd className={cn("font-mono", b.ok ? "text-chart-2" : "text-destructive")}>
                          {b.current} / {b.threshold}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>

              {selected.status === "open" ? (
                <section className="space-y-3 border-t border-border pt-4">
                  <Textarea
                    rows={3}
                    placeholder="Add an override note — your reasoning is stored in the audit trail."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => decide("approved")}>
                      <CheckCircle2 className="mr-1.5 size-4" /> Approve as proposed
                    </Button>
                    <Button variant="secondary" onClick={() => decide("modified")}>
                      <PencilLine className="mr-1.5 size-4" /> Approve with change
                    </Button>
                    <Button variant="destructive" onClick={() => decide("rejected")}>
                      <XCircle className="mr-1.5 size-4" /> Reject
                    </Button>
                  </div>
                </section>
              ) : (
                <section className="rounded-md border border-border bg-secondary px-3 py-2 text-sm">
                  <span className="font-medium capitalize">{selected.status}</span> — {selected.resolution}
                </section>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
}
