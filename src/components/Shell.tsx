import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Activity, ClipboardList, GitBranch, Inbox, ScrollText, SlidersHorizontal } from "lucide-react";
import { useFund } from "@/lib/fund-store";

const nav = [
  { to: "/", label: "Operations", icon: Activity },
  { to: "/pipeline", label: "Agent pipeline", icon: GitBranch },
  { to: "/inbox", label: "Exception inbox", icon: Inbox },
  { to: "/autonomy", label: "Autonomy", icon: SlidersHorizontal },
  { to: "/setup", label: "Fund setup", icon: ClipboardList },
  { to: "/audit", label: "Audit trail", icon: ScrollText },
] as const;

export function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { fund, exceptions } = useFund();
  const openCount = exceptions.filter((e) => e.status === "open").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
        <aside className="lg:w-60 lg:shrink-0">
          <div className="mb-6 flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-md bg-primary font-mono text-sm font-bold text-primary-foreground">
              M
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{fund.name}</p>
              <p className="text-xs text-muted-foreground">{fund.baseCurrency} · agent-operated</p>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground data-[status=active]:font-medium"
              >
                <Icon className="size-4" />
                {label}
                {to === "/inbox" && openCount > 0 && (
                  <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 font-mono text-[10px] text-destructive-foreground">
                    {openCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 border-b border-border pb-4">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
