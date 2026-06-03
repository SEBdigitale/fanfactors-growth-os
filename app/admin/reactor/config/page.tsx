import Link from "next/link";
import { fanFactorsReactorConfig } from "@/lib/reactor";

export const dynamic = "force-dynamic";

export default function ReactorConfigPage() {
  const config = fanFactorsReactorConfig;

  return (
    <main className="admin-shell reactor-shell">
      <header className="admin-header reactor-header">
        <div>
          <p className="eyebrow">MC2 Lead Reactor</p>
          <h1>Client Config</h1>
          <p>The operating rules for turning FanFactors into the first internal Reactor case study.</p>
        </div>
        <nav className="reactor-nav" aria-label="Reactor navigation">
          <Link href="/admin/reactor">Mission</Link>
          <Link href="/admin/reactor/leads">Leads</Link>
          <Link href="/admin/reactor/config">Config</Link>
        </nav>
      </header>

      <section className="reactor-panel-grid" aria-label="Client configuration">
        <article className="reactor-panel reactor-panel-large">
          <span>Client</span>
          <strong>{config.clientName}</strong>
          <p>{config.primaryGoal}</p>
        </article>
        <article className="reactor-panel">
          <span>System</span>
          <strong>{config.systemName}</strong>
          <p>{config.internalProductName}</p>
        </article>
        <article className="reactor-panel">
          <span>Cadence</span>
          <strong>{config.cadence.maxEmailsPerLeadPerWeek}/week</strong>
          <p>Maximum {config.cadence.maxFollowupsPerSequence} follow-ups per sequence.</p>
        </article>
      </section>

      <section className="reactor-config-grid">
        <ConfigList title="Target markets" items={config.targetMarkets} />
        <ConfigList title="Excluded leads" items={config.excludedLeads} />
        <ConfigList title="Tone of voice" items={config.toneOfVoice} />
        <ConfigList title="Approved claims" items={config.approvedClaims} />
        <ConfigList title="Banned claims" items={config.bannedClaims} />
        <ConfigList title="Human approval required" items={config.humanApprovalRequired} />
      </section>

      <section className="reactor-table-wrap" aria-label="Scoring rules">
        <div className="reactor-section-heading">
          <p className="eyebrow">Scoring model</p>
        </div>
        <table className="reactor-table">
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
      </section>
    </main>
  );
}

function ConfigList({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="reactor-panel">
      <span>{title}</span>
      <ul className="reactor-config-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
