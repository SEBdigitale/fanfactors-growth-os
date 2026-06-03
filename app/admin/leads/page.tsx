import Link from "next/link";
import { readLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await readLeads();
  const qualified = leads.filter((lead) => lead.status === "qualified").length;
  const nurture = leads.filter((lead) => lead.status === "nurture").length;
  const campaigns = new Set(leads.map((lead) => lead.campaignSlug)).size;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Lead command center</h1>
          <p>Review captured demand, qualification score, tags, and tracked FanFactors handoff links.</p>
        </div>
        <div className="admin-actions">
          <Link className="secondary-link" href="/admin/reactor">
            MC2 Reactor
          </Link>
          <Link className="secondary-link" href="/">
            Campaigns
          </Link>
        </div>
      </header>

      <section className="stats-grid" aria-label="Lead stats">
        <div className="stat-card">
          <span>Total leads</span>
          <strong>{leads.length}</strong>
        </div>
        <div className="stat-card">
          <span>Qualified</span>
          <strong>{qualified}</strong>
        </div>
        <div className="stat-card">
          <span>Nurture</span>
          <strong>{nurture}</strong>
        </div>
        <div className="stat-card">
          <span>Campaigns</span>
          <strong>{campaigns}</strong>
        </div>
      </section>

      <section className="lead-grid" aria-label="Leads">
        {leads.map((lead) => (
          <article className="lead-card" key={lead.id}>
            <span>{lead.campaignSlug}</span>
            <strong>{lead.name}</strong>
            <p>{lead.email}</p>
            <p>{lead.goal}</p>
            <div className="lead-meta">
              <b>{lead.status}</b>
              <b>{lead.score}/100</b>
              <b>{lead.role}</b>
            </div>
            <p>{lead.tags.join(", ")}</p>
            <Link className="text-link" href={lead.nextUrl}>
              FanFactors handoff
            </Link>
          </article>
        ))}

        {leads.length === 0 ? (
          <article className="lead-card">
            <span>No leads yet</span>
            <strong>Submit a campaign form to populate this view.</strong>
            <p>The local store lives at data/leads.json until a database is connected.</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}
