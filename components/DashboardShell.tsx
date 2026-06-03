import Link from "next/link";
import type { ReactNode } from "react";

type DashboardNavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  badgeTone?: "green";
};

const navSections: { label: string; items: DashboardNavItem[] }[] = [
  {
    label: "Command",
    items: [
      { href: "/mission-control", label: "Mission Control", icon: "M" },
      { href: "/leads", label: "Lead Database", icon: "L", badge: "18", badgeTone: "green" },
      { href: "/campaigns", label: "Campaigns", icon: "C" }
    ]
  },
  {
    label: "AI Engine",
    items: [
      { href: "/agent-console", label: "Agent Console", icon: "A", badge: "12" },
      { href: "/messages/approval", label: "Approvals", icon: "R", badge: "6" }
    ]
  },
  {
    label: "Intelligence",
    items: [
      { href: "/reports", label: "Weekly Report", icon: "W" },
      { href: "/configuration", label: "Configuration", icon: "S" }
    ]
  }
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
        <Link href="/mission-control" className="dashboard-logo">
          <strong>
            MC² <span>Lead Reactor</span>
          </strong>
          <small>Prospecting OS</small>
        </Link>
        <nav className="dashboard-menu" aria-label="Dashboard navigation">
          {navSections.map((section) => (
            <div key={section.label} className="dashboard-nav-section">
              <div className="dashboard-nav-label">{section.label}</div>
              {section.items.map((item) => (
                <Link key={item.href} href={item.href} className={active === item.href ? "is-active" : ""}>
                  <i aria-hidden="true">{item.icon}</i>
                  {item.label}
                  {item.badge ? (
                    <span className={`dashboard-nav-badge ${item.badgeTone === "green" ? "is-green" : ""}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="dashboard-client-selector">
          <div className="dashboard-client-pill">
            <span />
            <div>
              <strong>FanFactors</strong>
              <small>MC² Core Plan</small>
            </div>
            <b>v</b>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-title">{title}</div>
          <div className="dashboard-topbar-actions">
            <Link href="/messages/approval">6 Pending</Link>
            <Link href="/campaigns" className="is-primary">
              New Campaign
            </Link>
          </div>
        </header>
        <div className="dashboard-content">
          <section className="dashboard-screen-intro">
            <p className="dashboard-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </section>
          {children}
        </div>
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
