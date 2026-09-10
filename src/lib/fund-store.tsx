import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  seedAgents,
  seedAudit,
  seedExceptions,
  seedFund,
  seedRuns,
  type Agent,
  type AuditEntry,
  type Autonomy,
  type ExceptionItem,
  type Fund,
  type PipelineRun,
} from "./fund-data";

type Store = {
  fund: Fund;
  agents: Agent[];
  runs: PipelineRun[];
  exceptions: ExceptionItem[];
  audit: AuditEntry[];
  updateFund: (patch: Partial<Fund>) => void;
  updateLimits: (patch: Partial<Fund["limits"]>) => void;
  setCapabilityAutonomy: (agentId: string, capabilityId: string, autonomy: Autonomy) => void;
  resolveException: (id: string, decision: "approved" | "rejected" | "modified", note: string) => void;
};

const FundContext = createContext<Store | null>(null);

const HUMAN = "M. Okafor (CIO)";

function stamp() {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

let auditSeq = 9100;

export function FundProvider({ children }: { children: ReactNode }) {
  const [fund, setFund] = useState<Fund>(seedFund);
  const [agents, setAgents] = useState<Agent[]>(seedAgents);
  const [runs, setRuns] = useState<PipelineRun[]>(seedRuns);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(seedExceptions);
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit);

  const log = useCallback((entry: Omit<AuditEntry, "id" | "at">) => {
    setAudit((prev) => [{ id: `A-${++auditSeq}`, at: stamp(), ...entry }, ...prev]);
  }, []);

  const updateFund = useCallback(
    (patch: Partial<Fund>) => {
      setFund((prev) => ({ ...prev, ...patch }));
      log({
        actor: HUMAN,
        actorType: "human",
        action: "Updated fund setup",
        detail: Object.keys(patch).join(", ") + " changed.",
        outcome: "logged",
      });
    },
    [log],
  );

  const updateLimits = useCallback(
    (patch: Partial<Fund["limits"]>) => {
      setFund((prev) => ({ ...prev, limits: { ...prev.limits, ...patch } }));
      log({
        actor: HUMAN,
        actorType: "human",
        action: "Updated risk limits",
        detail: Object.entries(patch)
          .map(([k, v]) => `${k} → ${v}`)
          .join(", "),
        outcome: "logged",
      });
    },
    [log],
  );

  const setCapabilityAutonomy = useCallback(
    (agentId: string, capabilityId: string, autonomy: Autonomy) => {
      let agentName = agentId;
      let capLabel = capabilityId;
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id !== agentId) return a;
          agentName = a.name;
          return {
            ...a,
            capabilities: a.capabilities.map((c) => {
              if (c.id !== capabilityId) return c;
              capLabel = c.label;
              return { ...c, autonomy };
            }),
          };
        }),
      );
      log({
        actor: HUMAN,
        actorType: "human",
        action: "Updated autonomy tier",
        detail: `${agentName} · '${capLabel}' set to ${autonomy}.`,
        outcome: "logged",
      });
    },
    [log],
  );

  const resolveException = useCallback(
    (id: string, decision: "approved" | "rejected" | "modified", note: string) => {
      let item: ExceptionItem | undefined;
      setExceptions((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          item = e;
          return { ...e, status: decision, resolution: note };
        }),
      );
      setRuns((prev) =>
        prev.map((run) => ({
          ...run,
          stages: run.stages.map((s) =>
            s.state === "active" || s.state === "blocked"
              ? decision === "rejected"
                ? { ...s, state: "blocked" as const, output: `Rejected by ${HUMAN}: ${note}` }
                : { ...s, state: "done" as const, output: `Cleared by ${HUMAN}: ${note}` }
              : s,
          ),
        })),
      );
      log({
        actor: HUMAN,
        actorType: "human",
        action: `${decision === "modified" ? "Modified" : decision === "approved" ? "Approved" : "Rejected"} ${id}`,
        detail: `${item?.title ?? id} — ${note}`,
        outcome: decision === "rejected" ? "blocked" : "executed",
      });
    },
    [log],
  );

  const value = useMemo(
    () => ({
      fund,
      agents,
      runs,
      exceptions,
      audit,
      updateFund,
      updateLimits,
      setCapabilityAutonomy,
      resolveException,
    }),
    [fund, agents, runs, exceptions, audit, updateFund, updateLimits, setCapabilityAutonomy, resolveException],
  );

  return <FundContext.Provider value={value}>{children}</FundContext.Provider>;
}

export function useFund() {
  const ctx = useContext(FundContext);
  if (!ctx) throw new Error("useFund must be used inside FundProvider");
  return ctx;
}
