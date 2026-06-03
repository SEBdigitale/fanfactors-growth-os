import { DashboardShell, KpiCard, StatusBadge } from "@/components/DashboardShell";
import { formatAgentStatus, getAgentStatusTone, getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AgentConsolePage() {
  const { agents, events } = await getDashboardData();
  const needsReview = agents.filter((agent) => agent.status === "needs_review").length;
  const active = agents.filter((agent) => ["active", "ready", "guarding", "scheduled"].includes(agent.status)).length;
  const groups = ["Strategy", "Lead Engine", "Campaign Engine", "Pipeline", "Growth Loop"] as const;

  return (
    <DashboardShell
      active="/agent-console"
      title="AI Agent Console"
      description="The 12-agent operating team behind strategy, lead discovery, qualification, campaign building, compliance, pipeline control, optimization, and reporting."
    >
      <section className="dashboard-kpi-grid">
        <KpiCard label="Agents" value={agents.length} detail="Specialized operating roles" />
        <KpiCard label="Active" value={active} detail="Ready or working states" />
        <KpiCard label="Needs review" value={needsReview} detail="Human decision required" />
        <KpiCard label="Events" value={events.length} detail="Tracked funnel activity" />
      </section>

      <section className="dashboard-agent-group-grid">
        {groups.map((group) => {
          const groupAgents = agents.filter((agent) => agent.group === group);

          return (
            <article key={group} className="dashboard-card dashboard-agent-group">
              <div className="dashboard-card-header">
                <div>
                  <span>Agent group</span>
                  <h2>{group}</h2>
                </div>
                <StatusBadge tone="neutral">{groupAgents.length}</StatusBadge>
              </div>

              <div className="dashboard-agent-list">
                {groupAgents.map((agent) => (
                  <div key={agent.id} className="dashboard-agent-row">
                    <div className="dashboard-agent-row-top">
                      <strong>{agent.shortName}</strong>
                      <StatusBadge tone={getAgentStatusTone(agent.status)}>{formatAgentStatus(agent.status)}</StatusBadge>
                    </div>
                    <p>{agent.purpose}</p>
                    <div className="dashboard-code-block dashboard-code-block-compact">
                      <strong>Latest output</strong>
                      <pre>{JSON.stringify(agent.output, null, 2)}</pre>
                    </div>
                    {agent.error ? <p className="dashboard-error">{agent.error}</p> : null}
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </DashboardShell>
  );
}
