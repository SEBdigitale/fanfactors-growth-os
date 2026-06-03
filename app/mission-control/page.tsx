import Link from "next/link";
import { DashboardShell, KpiCard, StatusBadge } from "@/components/DashboardShell";
import { formatAgentStatus, getAgentStatusTone, getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function MissionControlPage() {
  const { agents, approvals, campaigns, health, leads, metrics, report } = await getDashboardData();
  const recentLeads = leads.slice(0, 5);
  const topCampaigns = campaigns.slice().sort((a, b) => b.leads - a.leads).slice(0, 3);
  const activeAgents = agents.filter((agent) => ["active", "ready", "guarding", "scheduled"].includes(agent.status));
  const reviewAgents = agents.filter((agent) => agent.status === "needs_review");
  const latestDecision = agents.find((agent) => agent.shortName === "Strategy Architect") ?? agents[0];

  return (
    <DashboardShell
      active="/mission-control"
      title="Mission Control"
      description="The command center for captured demand, campaign health, lead quality, approvals, and weekly moves."
    >
      <section className="dashboard-kpi-grid">
        <KpiCard label="Total leads" value={metrics.total} detail={`${metrics.campaigns} active campaign paths`} />
        <KpiCard label="Qualified" value={metrics.qualified} detail={`${metrics.warm + metrics.hot} warm or better`} />
        <KpiCard label="Inbox verified" value={metrics.verified} detail="Report links clicked from email" />
        <KpiCard label="Average score" value={`${metrics.averageScore}/100`} detail="Current scoring model" />
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <article className="dashboard-card dashboard-card-large">
          <div className="dashboard-card-header">
            <div>
              <span>Campaign health</span>
              <h2>{health.label}</h2>
            </div>
            <StatusBadge tone={health.score >= 75 ? "good" : health.score >= 45 ? "warn" : "neutral"}>
              {health.score}/100
            </StatusBadge>
          </div>
          <div className="dashboard-meter" aria-label={`Campaign health score ${health.score} out of 100`}>
            <i style={{ width: `${health.score}%` }} />
          </div>
          <p>{health.recommendation}</p>
          <div className="dashboard-action-row">
            <Link href="/messages/approval">Review message drafts</Link>
            <Link href="/campaigns">Inspect campaigns</Link>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span>Approval queue</span>
              <h2>{approvals.length}</h2>
            </div>
            <StatusBadge tone="warn">Human review</StatusBadge>
          </div>
          <p>Drafts are held before outreach, follow-ups, or sensitive claims move forward.</p>
          <Link className="dashboard-text-link" href="/messages/approval">
            Open approval center
          </Link>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-three">
        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span>Top campaigns</span>
              <h2>Demand sources</h2>
            </div>
          </div>
          <div className="dashboard-list">
            {topCampaigns.map((campaign) => (
              <div key={campaign.slug} className="dashboard-list-row">
                <div>
                  <strong>{campaign.audience}</strong>
                  <p>{campaign.slug}</p>
                </div>
                <b>{campaign.leads}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span>Recent leads</span>
              <h2>Latest captured</h2>
            </div>
            <Link href="/leads">View all</Link>
          </div>
          <div className="dashboard-list">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="dashboard-list-row">
                <div>
                  <strong>{lead.name}</strong>
                  <p>{lead.campaignSlug}</p>
                </div>
                <b>{lead.score}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span>Agent state</span>
              <h2>{agents.length} agents</h2>
            </div>
            <StatusBadge tone={reviewAgents.length ? "warn" : "good"}>
              {reviewAgents.length ? `${reviewAgents.length} review` : "Clear"}
            </StatusBadge>
          </div>
          <div className="dashboard-agent-summary">
            <div>
              <span>Active / ready</span>
              <strong>{activeAgents.length}</strong>
            </div>
            <div>
              <span>Needs review</span>
              <strong>{reviewAgents.length}</strong>
            </div>
          </div>
          <div className="dashboard-list">
            {agents.slice(0, 5).map((agent) => (
              <div key={agent.id} className="dashboard-list-row">
                <div>
                  <strong>{agent.shortName}</strong>
                  <p>{agent.group}</p>
                </div>
                <StatusBadge tone={getAgentStatusTone(agent.status)}>{formatAgentStatus(agent.status)}</StatusBadge>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-card">
        <div className="dashboard-card-header">
          <div>
            <span>Weekly command brief</span>
            <h2>{report.period}</h2>
          </div>
          <Link href="/reports">Open reports</Link>
        </div>
        <p>{report.summary}</p>
      </section>

      <section className="dashboard-card">
        <div className="dashboard-card-header">
          <div>
            <span>Latest agent decision</span>
            <h2>{latestDecision.shortName}</h2>
          </div>
          <StatusBadge tone={getAgentStatusTone(latestDecision.status)}>
            {formatAgentStatus(latestDecision.status)}
          </StatusBadge>
        </div>
        <p>{latestDecision.purpose}</p>
        <div className="dashboard-code-block dashboard-code-block-compact">
          <strong>Decision data</strong>
          <pre>{JSON.stringify(latestDecision.output, null, 2)}</pre>
        </div>
      </section>
    </DashboardShell>
  );
}
