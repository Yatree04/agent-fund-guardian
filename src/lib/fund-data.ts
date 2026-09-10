export type Autonomy = "autonomous" | "approval" | "prohibited";

export type Capability = {
  id: string;
  label: string;
  description: string;
  autonomy: Autonomy;
};

export type AgentRole = "Research" | "Portfolio" | "Risk" | "Trading";

export type Agent = {
  id: string;
  name: string;
  role: AgentRole;
  model: string;
  status: "idle" | "running" | "waiting" | "halted";
  heartbeat: string;
  tasksToday: number;
  successRate: number;
  capabilities: Capability[];
};

export type RiskLimits = {
  maxPositionPct: number;
  maxSectorPct: number;
  maxDrawdownPct: number;
  maxGrossLeverage: number;
  dailyVarPct: number;
  minCashPct: number;
};

export type Fund = {
  name: string;
  mandate: string;
  strategy: string;
  benchmark: string;
  baseCurrency: string;
  aum: number;
  limits: RiskLimits;
};

export type PipelineStage = {
  id: string;
  role: AgentRole;
  title: string;
  detail: string;
  state: "done" | "active" | "blocked" | "queued";
  startedAt: string;
  durationMs: number;
  output: string;
};

export type PipelineRun = {
  id: string;
  thesis: string;
  ticker: string;
  createdAt: string;
  stages: PipelineStage[];
};

export type ExceptionItem = {
  id: string;
  raisedBy: AgentRole;
  title: string;
  ticker: string;
  severity: "critical" | "high" | "medium";
  createdAt: string;
  reason: string;
  proposal: string;
  confidence: number;
  notional: number;
  evidence: { label: string; value: string }[];
  breaches: { limit: string; current: string; threshold: string; ok: boolean }[];
  status: "open" | "approved" | "rejected" | "modified";
  resolution?: string;
};

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  actorType: "agent" | "human" | "system";
  action: string;
  detail: string;
  outcome: "executed" | "blocked" | "pending" | "logged";
};

export const seedFund: Fund = {
  name: "Meridian Systematic Alpha",
  mandate: "Global equity long/short with macro overlay",
  strategy:
    "Multi-factor quality-momentum selection across developed-market equities, hedged with index futures. Agents research, size, risk-check, and route orders under committee-defined limits.",
  benchmark: "MSCI World Net TR",
  baseCurrency: "USD",
  aum: 486_400_000,
  limits: {
    maxPositionPct: 5,
    maxSectorPct: 22,
    maxDrawdownPct: 12,
    maxGrossLeverage: 1.8,
    dailyVarPct: 2.4,
    minCashPct: 3,
  },
};

const cap = (id: string, label: string, description: string, autonomy: Autonomy): Capability => ({
  id,
  label,
  description,
  autonomy,
});

export const seedAgents: Agent[] = [
  {
    id: "research",
    name: "Atlas Research",
    role: "Research",
    model: "Lovable AI · reasoning",
    status: "running",
    heartbeat: "8s ago",
    tasksToday: 148,
    successRate: 97,
    capabilities: [
      cap("ingest", "Ingest market & filing data", "Pull prices, filings, transcripts.", "autonomous"),
      cap("thesis", "Publish investment thesis", "Write and score a new idea.", "autonomous"),
      cap("altdata", "Purchase alternative data", "Spend budget on external datasets.", "approval"),
      cap("contact", "Contact issuer management", "Outbound communication with companies.", "prohibited"),
    ],
  },
  {
    id: "portfolio",
    name: "Vega Portfolio",
    role: "Portfolio",
    model: "Lovable AI · reasoning",
    status: "waiting",
    heartbeat: "24s ago",
    tasksToday: 62,
    successRate: 94,
    capabilities: [
      cap("size", "Size positions within limits", "Optimise weights under mandate limits.", "autonomous"),
      cap("rebalance", "Trigger scheduled rebalance", "Monthly drift correction.", "autonomous"),
      cap("newname", "Add a new name to the book", "Open exposure to an unheld issuer.", "approval"),
      cap("leverage", "Change gross leverage target", "Alter fund-level leverage.", "approval"),
      cap("mandate", "Trade outside mandate universe", "Non-permitted asset classes.", "prohibited"),
    ],
  },
  {
    id: "risk",
    name: "Sentinel Risk",
    role: "Risk",
    model: "Lovable AI · reasoning",
    status: "running",
    heartbeat: "3s ago",
    tasksToday: 311,
    successRate: 99,
    capabilities: [
      cap("monitor", "Continuous limit monitoring", "Evaluate VaR, drawdown, concentration.", "autonomous"),
      cap("halt", "Halt trading on breach", "Kill-switch on hard limit breach.", "autonomous"),
      cap("waiver", "Grant a temporary limit waiver", "Relax a soft limit for a window.", "approval"),
      cap("editlimits", "Edit mandate risk limits", "Change committee-set thresholds.", "prohibited"),
    ],
  },
  {
    id: "trading",
    name: "Kestrel Trading",
    role: "Trading",
    model: "Lovable AI · execution",
    status: "idle",
    heartbeat: "12s ago",
    tasksToday: 89,
    successRate: 96,
    capabilities: [
      cap("route", "Route child orders", "Slice and route approved parent orders.", "autonomous"),
      cap("venue", "Select execution venue", "Choose lit/dark venues by cost model.", "autonomous"),
      cap("block", "Execute block trade > $10m", "Large single-print liquidity events.", "approval"),
      cap("derivs", "Trade OTC derivatives", "Bilateral, non-cleared instruments.", "prohibited"),
    ],
  },
];

export const seedRuns: PipelineRun[] = [
  {
    id: "run-4821",
    thesis: "Semis capex inflection — add to leader",
    ticker: "ASML",
    createdAt: "09:41",
    stages: [
      {
        id: "s1",
        role: "Research",
        title: "Signal & thesis",
        detail: "Order-book commentary + 12 broker revisions",
        state: "done",
        startedAt: "09:41",
        durationMs: 42_000,
        output: "Conviction 0.78 · EPS revision breadth +14% MoM · thesis published",
      },
      {
        id: "s2",
        role: "Portfolio",
        title: "Sizing & construction",
        detail: "Target weight vs. factor budget",
        state: "done",
        startedAt: "09:42",
        durationMs: 18_000,
        output: "Proposed +90bps to 4.1% weight, funded from cash",
      },
      {
        id: "s3",
        role: "Risk",
        title: "Pre-trade risk check",
        detail: "Concentration, VaR, sector limits",
        state: "active",
        startedAt: "09:43",
        durationMs: 0,
        output: "Sector exposure would reach 22.8% vs 22% limit — escalated",
      },
      {
        id: "s4",
        role: "Trading",
        title: "Execution",
        detail: "Awaiting risk clearance",
        state: "queued",
        startedAt: "—",
        durationMs: 0,
        output: "Blocked until exception EX-1042 is resolved",
      },
    ],
  },
  {
    id: "run-4820",
    thesis: "Trim staples on multiple compression",
    ticker: "NESN",
    createdAt: "09:12",
    stages: [
      {
        id: "s1",
        role: "Research",
        title: "Signal & thesis",
        detail: "Valuation screen + volume decay",
        state: "done",
        startedAt: "09:12",
        durationMs: 36_000,
        output: "Downgrade to underweight, conviction 0.61",
      },
      {
        id: "s2",
        role: "Portfolio",
        title: "Sizing & construction",
        detail: "Reduce to benchmark weight",
        state: "done",
        startedAt: "09:13",
        durationMs: 11_000,
        output: "Trim 120bps → 1.4% weight",
      },
      {
        id: "s3",
        role: "Risk",
        title: "Pre-trade risk check",
        detail: "All limits within tolerance",
        state: "done",
        startedAt: "09:14",
        durationMs: 6_000,
        output: "Cleared automatically · VaR impact −0.05%",
      },
      {
        id: "s4",
        role: "Trading",
        title: "Execution",
        detail: "VWAP over 90 minutes",
        state: "done",
        startedAt: "09:15",
        durationMs: 5_400_000,
        output: "Filled 100% · slippage 3.2bps vs arrival",
      },
    ],
  },
  {
    id: "run-4819",
    thesis: "Hedge macro tail with index futures",
    ticker: "ESZ5",
    createdAt: "08:55",
    stages: [
      {
        id: "s1",
        role: "Research",
        title: "Signal & thesis",
        detail: "Rate vol regime shift detected",
        state: "done",
        startedAt: "08:55",
        durationMs: 27_000,
        output: "Regime probability 0.66 risk-off",
      },
      {
        id: "s2",
        role: "Portfolio",
        title: "Sizing & construction",
        detail: "Overlay 8% notional short",
        state: "blocked",
        startedAt: "08:57",
        durationMs: 0,
        output: "Leverage target change requires human approval",
      },
      {
        id: "s3",
        role: "Risk",
        title: "Pre-trade risk check",
        detail: "Not started",
        state: "queued",
        startedAt: "—",
        durationMs: 0,
        output: "—",
      },
      {
        id: "s4",
        role: "Trading",
        title: "Execution",
        detail: "Not started",
        state: "queued",
        startedAt: "—",
        durationMs: 0,
        output: "—",
      },
    ],
  },
];

export const seedExceptions: ExceptionItem[] = [
  {
    id: "EX-1042",
    raisedBy: "Risk",
    title: "Sector concentration limit would be breached",
    ticker: "ASML",
    severity: "critical",
    createdAt: "09:43",
    reason:
      "Vega Portfolio proposes increasing Information Technology exposure to 22.8%, above the mandate ceiling of 22%. Sentinel Risk halted the pipeline and escalated instead of auto-rejecting, because the breach is 0.8pp and reversible intraday.",
    proposal: "Approve a reduced add of +55bps (sector lands at 21.9%) instead of +90bps.",
    confidence: 0.78,
    notional: 4_380_000,
    evidence: [
      { label: "Thesis conviction", value: "0.78 (Atlas Research)" },
      { label: "EPS revision breadth", value: "+14% MoM, 12 brokers" },
      { label: "Liquidity", value: "0.7x ADV over 2 days" },
      { label: "Correlation to book", value: "0.62 with existing semis sleeve" },
    ],
    breaches: [
      { limit: "Sector exposure", current: "22.8%", threshold: "22.0%", ok: false },
      { limit: "Single position", current: "4.1%", threshold: "5.0%", ok: true },
      { limit: "Daily VaR", current: "2.11%", threshold: "2.40%", ok: true },
    ],
    status: "open",
  },
  {
    id: "EX-1041",
    raisedBy: "Portfolio",
    title: "Gross leverage target increase requested",
    ticker: "ESZ5",
    severity: "high",
    createdAt: "08:57",
    reason:
      "A macro tail hedge requires lifting gross leverage from 1.62x to 1.74x. Changing the leverage target is an approval-tier capability for Vega Portfolio, so the run is paused pending sign-off.",
    proposal: "Approve short overlay of 8% notional via index futures for 10 trading days.",
    confidence: 0.66,
    notional: 38_900_000,
    evidence: [
      { label: "Regime model", value: "0.66 probability risk-off" },
      { label: "Hedge cost", value: "9bps of NAV over the window" },
      { label: "Beta after hedge", value: "0.71 vs 0.83 today" },
    ],
    breaches: [
      { limit: "Gross leverage", current: "1.74x", threshold: "1.80x", ok: true },
      { limit: "Min cash", current: "3.4%", threshold: "3.0%", ok: true },
    ],
    status: "open",
  },
  {
    id: "EX-1039",
    raisedBy: "Trading",
    title: "Block trade above autonomous size ceiling",
    ticker: "NVO",
    severity: "medium",
    createdAt: "08:20",
    reason:
      "Kestrel Trading located a $12.4m block at 4bps inside the volume curve. Blocks above $10m are approval-tier, so execution is held for a human decision before the counterparty window closes.",
    proposal: "Approve the block print at 4bps inside arrival price.",
    confidence: 0.91,
    notional: 12_400_000,
    evidence: [
      { label: "Counterparty", value: "Tier-1 broker, natural seller" },
      { label: "Expected saving", value: "~$52k vs. sliced VWAP" },
      { label: "Window", value: "Expires in 14 minutes" },
    ],
    breaches: [{ limit: "Single position", current: "3.6%", threshold: "5.0%", ok: true }],
    status: "open",
  },
];

export const seedAudit: AuditEntry[] = [
  {
    id: "A-9007",
    at: "09:43:12",
    actor: "Sentinel Risk",
    actorType: "agent",
    action: "Escalated exception EX-1042",
    detail: "Pre-trade sector limit breach on ASML add — pipeline run-4821 halted.",
    outcome: "pending",
  },
  {
    id: "A-9006",
    at: "09:42:47",
    actor: "Vega Portfolio",
    actorType: "agent",
    action: "Proposed position change",
    detail: "ASML +90bps to 4.1% target weight, funded from cash.",
    outcome: "blocked",
  },
  {
    id: "A-9005",
    at: "09:41:02",
    actor: "Atlas Research",
    actorType: "agent",
    action: "Published thesis",
    detail: "Semis capex inflection, conviction 0.78, 12 supporting sources.",
    outcome: "logged",
  },
  {
    id: "A-9004",
    at: "09:15:30",
    actor: "Kestrel Trading",
    actorType: "agent",
    action: "Executed order",
    detail: "NESN trim 120bps filled via VWAP, slippage 3.2bps.",
    outcome: "executed",
  },
  {
    id: "A-9003",
    at: "08:58:11",
    actor: "M. Okafor (CIO)",
    actorType: "human",
    action: "Updated autonomy tier",
    detail: "Vega Portfolio · 'Change gross leverage target' set to human approval required.",
    outcome: "logged",
  },
  {
    id: "A-9002",
    at: "08:31:04",
    actor: "System",
    actorType: "system",
    action: "Mandate limits loaded",
    detail: "Committee limit set v14 applied to all agents.",
    outcome: "logged",
  },
];

export const navHistory = [
  { t: "09:00", nav: 100.0, bench: 100.0, var: 1.9 },
  { t: "09:30", nav: 100.24, bench: 100.11, var: 2.0 },
  { t: "10:00", nav: 100.41, bench: 100.18, var: 2.05 },
  { t: "10:30", nav: 100.32, bench: 100.09, var: 2.12 },
  { t: "11:00", nav: 100.58, bench: 100.22, var: 2.08 },
  { t: "11:30", nav: 100.77, bench: 100.31, var: 2.11 },
  { t: "12:00", nav: 100.69, bench: 100.27, var: 2.16 },
  { t: "12:30", nav: 100.94, bench: 100.4, var: 2.11 },
];

export const currency = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}m`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}k`
      : `$${n}`;
