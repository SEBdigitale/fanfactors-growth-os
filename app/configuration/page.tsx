import { DashboardShell, KpiCard } from "@/components/DashboardShell";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function ConfigurationPage() {
  const { config } = await getDashboardData();

  return (
    <DashboardShell
      active="/configuration"
      title="Configuration"
      description="The reusable client operating file that tells MC² Lead Reactor who to target, what to avoid, and what claims are allowed."
    >
      <section className="dashboard-kpi-grid">
        <KpiCard label="Client" value={config.clientName} detail={config.industry} />
        <KpiCard label="System" value={config.systemName} detail={config.internalProductName} />
        <KpiCard label="Cadence" value={`${config.cadence.maxEmailsPerLeadPerWeek}/week`} detail="Per lead maximum" />
        <KpiCard label="Follow-ups" value={config.cadence.maxFollowupsPerSequence} detail="Per sequence maximum" />
      </section>

      <section className="dashboard-config-grid">
        <ConfigCard title="Target markets" items={config.targetMarkets} />
        <ConfigCard title="Excluded leads" items={config.excludedLeads} />
        <ConfigCard title="Tone of voice" items={config.toneOfVoice} />
        <ConfigCard title="Approved claims" items={config.approvedClaims} />
        <ConfigCard title="Banned claims" items={config.bannedClaims} />
        <ConfigCard title="Human approval required" items={config.humanApprovalRequired} />
      </section>

      <section className="dashboard-card">
        <div className="dashboard-table-tools">
          <div>
            <span>Scoring rules</span>
            <h2>Qualification model</h2>
          </div>
        </div>
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th>Signal</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {config.scoringRules.map((rule) => (
                <tr key={rule.factor}>
                  <td>{rule.factor}</td>
                  <td>{rule.signal}</td>
                  <td>{rule.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}

function ConfigCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="dashboard-card">
      <span>{title}</span>
      <ul className="dashboard-bullet-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
