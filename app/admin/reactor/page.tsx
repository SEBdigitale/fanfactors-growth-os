import Link from "next/link";
import { readLeadEvents } from "@/lib/events";
import { readLeads } from "@/lib/leads";
import { fanFactorsReactorConfig, getCampaignHealth, getReactorMetrics } from "@/lib/reactor";

export const dynamic = "force-dynamic";

export default async function ReactorMissionControlPage() {
  const [leads, events] = await Promise.all([readLeads(), readLeadEvents()]);
  const metrics = getReactorMetrics(leads);
  const health = getCampaignHealth(leads);
  const recentLeads = leads.slice(0, 6);
  const recentEvents = events.slice(0, 6);

  return (
    <main className="admin-shell reactor-shell">
      <header className="admin-header reactor-header">
        <div>
          <p className="eyebrow">MC2 Lead Reactor</p>
          <h1>Mission Control</h1>
          <p>
            Internal command center for {fanFactorsReactorConfig.internalProductName}: pipeline signal, lead quality,
            campaign health, and the next action.
          </p>
        </div>
        <nav className="reactor-nav" aria-label="Reactor navigation">
          <Link href="/admin/reactor">Mission</Link>
          <Link href="/admin/reactor/leads">Leads</Link>
          <Link href="/admin/reactor/config">Config</Link>
        </nav>
      </header>

      <section className="stats-grid" aria-label="Reactor stats">
        <div className="stat-card">
          <span>Total leads</span>
          <strong>{metrics.total}</strong>
        </div>
        <div className="stat-card">
          <span>Qualified</span>
          <strong>{metrics.qualified}</strong>
        </div>
        <div className="stat-card">
          <span>Hot leads</span>
          <strong>{metrics.hot}</strong>
        </div>
        <div className="stat-card">
          <span>Inbox verified</span>
          <strong>{metrics.verified}</strong>
        </div>
      </section>

      <section className="reactor-panel-grid" aria-label="Campaign operating state">
        <article className="reactor-panel reactor-panel-large">
          <span>Campaign health</span>
          <strong>{health.label}</strong>
          <div className="health-meter" aria-label={`Health score ${health.score} out of 100`}>
            <i style={{ width: `${health.score}%` }} />
          </div>
          <p>{health.recommendation}</p>
        </article>

        <article className="reactor-panel">
          <span>Average score</span>
          <strong>{metrics.averageScore}/100</strong>
          <p>Lead quality across the current FanFactors capture system.</p>
        </article>

        <article className="reactor-panel">
          <span>Top campaign</span>
          <strong>{metrics.bestCampaign}</strong>
          <p>The campaign currently producing the most captured demand.</p>
        </article>
      </section>

      <section className="reactor-two-column">
        <div>
          <div className="reactor-section-heading">
            <p className="eyebrow">Recent leads</p>
            <Link className="text-link" href="/admin/reactor/leads">
              View all
            </Link>
          </div>
          <div className="reactor-list">
            {recentLeads.map((lead) => (
              <article key={lead.id} className="reactor-row">
                <div>
                  <strong>{lead.name}</strong>
                  <p>{lead.email}</p>
                </div>
                <b>{lead.score}/100</b>
              </article>
            ))}
            {recentLeads.length === 0 ? <p className="empty-note">No leads captured yet.</p> : null}
          </div>
        </div>

        <div>
          <div className="reactor-section-heading">
            <p className="eyebrow">Recent events</p>
          </div>
          <div className="reactor-list">
            {recentEvents.map((event) => (
              <article key={event.id} className="reactor-row">
                <div>
                  <strong>{event.event}</strong>
                  <p>{new Date(event.createdAt).toLocaleString()}</p>
                </div>
              </article>
            ))}
            {recentEvents.length === 0 ? <p className="empty-note">No tracked events yet.</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
