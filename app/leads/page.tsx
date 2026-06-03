import { DashboardShell, KpiCard, StatusBadge } from "@/components/DashboardShell";
import { getDashboardData, getLeadSegment } from "@/lib/dashboard";
import { getLeadStatusLabel } from "@/lib/reactor";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { leads, metrics } = await getDashboardData();

  return (
    <DashboardShell
      active="/leads"
      title="Lead Database"
      description="A working prospect table with status, score, campaign, source, and verification signal."
    >
      <section className="dashboard-kpi-grid">
        <KpiCard label="Total records" value={metrics.total} detail="All captured contacts" />
        <KpiCard label="Warm+" value={metrics.warm + metrics.hot} detail="Score is 60 or higher" />
        <KpiCard label="Nurture" value={metrics.nurture} detail="Needs more proof or education" />
        <KpiCard label="Verified" value={metrics.verified} detail="Clicked through email gate" />
      </section>

      <section className="dashboard-card">
        <div className="dashboard-table-tools">
          <div>
            <span>Pipeline records</span>
            <h2>Lead intelligence</h2>
          </div>
          <div className="dashboard-filter-pills">
            <b>Hot</b>
            <b>Warm</b>
            <b>Nurture</b>
            <b>Verified</b>
          </div>
        </div>
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Segment</th>
                <th>Campaign</th>
                <th>Status</th>
                <th>Score</th>
                <th>Role</th>
                <th>Source</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.name}</strong>
                    <span>{lead.email}</span>
                  </td>
                  <td>
                    <StatusBadge tone={lead.score >= 60 ? "good" : "neutral"}>{getLeadSegment(lead)}</StatusBadge>
                  </td>
                  <td>{lead.campaignSlug}</td>
                  <td>{getLeadStatusLabel(lead.status)}</td>
                  <td>{lead.score}/100</td>
                  <td>{lead.role}</td>
                  <td>{lead.source || "Direct"}</td>
                  <td>{lead.metadata?.email_verified_at ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 ? <p className="dashboard-empty">No leads captured yet.</p> : null}
        </div>
      </section>
    </DashboardShell>
  );
}
