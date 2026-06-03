import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/mission-control", label: "Mission Control" },
  { href: "/leads", label: "Leads" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/messages/approval", label: "Approvals" },
  { href: "/agent-console", label: "Agent Console" },
  { href: "/reports", label: "Reports" },
  { href: "/configuration", label: "Configuration" }
];

export function DashboardShell({
  active,
  title,
  eyebrow = "MC² Lead Reactor",
  description,
  children
}: {
  active: string;
  title: string;
  eyebrow?: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-app">
      <aside className="dashboard-sidebar">
        <Link href="/mission-control" className="dashboard-brand">
          <span>MC²</span>
          <strong>Lead Reactor</strong>
        </Link>
        <nav className="dashboard-menu" aria-label="Dashboard navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={active === item.href ? "is-active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="dashboard-client-pill">
            <span>Client</span>
            <strong>FanFactors</strong>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="dashboard-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" }) {
  return <span className={`dashboard-badge dashboard-badge-${tone}`}>{children}</span>;
}
