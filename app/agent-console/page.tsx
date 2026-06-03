import { DashboardShell, KpiCard, StatusBadge } from "@/components/DashboardShell";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AgentConsolePage() {
  const { agents, events } = await getDashboardData();
  const needsReview = agents.filter((agent) => agent.status === "needs_review").length;
  const active = agents.filter((agent) => ["active", "ready", "guarding"].includes(agent.status)).length;

  return (
    <DashboardShell
      active="/agent-console"
      title="AI Agent Console"
      description="Transparent operating log for the strategy, scoring, personalization, compliance, and reporting agents."
    >
      <section className="dashboard-kpi-grid">
        <KpiCard label="Agents" value={agents.length} detail="Specialized operating roles" />
        <KpiCard label="Active" value={active} detail="Ready or working states" />
        <KpiCard label="Needs review" value={needsReview} detail="Human decision required" />
        <KpiCard label="Events" value={events.length} detail="Tracked funnel activity" />
      </section>

      <section className="dashboard-agent-grid">
        {agents.map((agent) => (
          <article key={agent.id} className="dashboard-card dashboard-agent-card">
            <div className="dashboard-card-header">
              <div>
                <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
                <h2>{agent.agentName}</h2>
              </div>
              <StatusBadge tone={agent.status === "needs_review" ? "warn" : "good"}>{agent.status}</StatusBadge>
            </div>
            <div className="dashboard-code-block">
              <strong>Output</strong>
              <pre>{JSON.stringify(agent.output, null, 2)}</pre>
            </div>
            {agent.error ? <p className="dashboard-error">{agent.error}</p> : null}
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}
