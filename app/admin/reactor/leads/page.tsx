import Link from "next/link";
import { readLeads } from "@/lib/leads";
import { getLeadStatusLabel, getReactorMetrics } from "@/lib/reactor";

export const dynamic = "force-dynamic";

export default async function ReactorLeadsPage() {
  const leads = await readLeads();
  const metrics = getReactorMetrics(leads);

  return (
    <main className="admin-shell reactor-shell">
      <header className="admin-header reactor-header">
        <div>
          <p className="eyebrow">MC2 Lead Reactor</p>
          <h1>Lead Database</h1>
          <p>Every captured lead with score, segment, source, status, funnel path, and verification signal.</p>
        </div>
        <nav className="reactor-nav" aria-label="Reactor navigation">
          <Link href="/admin/reactor">Mission</Link>
          <Link href="/admin/reactor/leads">Leads</Link>
          <Link href="/admin/reactor/config">Config</Link>
        </nav>
      </header>

      <section className="stats-grid" aria-label="Lead database stats">
        <div className="stat-card">
          <span>Total</span>
          <strong>{metrics.total}</strong>
        </div>
        <div className="stat-card">
          <span>Warm</span>
          <strong>{metrics.warm}</strong>
        </div>
        <div className="stat-card">
          <span>Nurture</span>
          <strong>{metrics.nurture}</strong>
        </div>
        <div className="stat-card">
          <span>Campaigns</span>
          <strong>{metrics.campaigns}</strong>
        </div>
      </section>

      <section className="reactor-table-wrap" aria-label="Lead database table">
        <table className="reactor-table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Campaign</th>
              <th>Status</th>
              <th>Score</th>
              <th>Role</th>
              <th>Source</th>
              <th>Verified</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <strong>{lead.name}</strong>
                  <span>{lead.email}</span>
                </td>
                <td>{lead.campaignSlug}</td>
                <td>{getLeadStatusLabel(lead.status)}</td>
                <td>{lead.score}/100</td>
                <td>{lead.role}</td>
                <td>{lead.source || "Direct"}</td>
                <td>{lead.metadata?.email_verified_at ? "Yes" : "No"}</td>
                <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 ? <p className="empty-note">No leads captured yet.</p> : null}
      </section>
    </main>
  );
}
