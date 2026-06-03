import { DashboardShell, KpiCard } from "@/components/DashboardShell";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { metrics, report } = await getDashboardData();

  return (
    <DashboardShell
      active="/reports"
      title="Reports"
      description="Weekly operator brief showing what happened, what matters, and what to test next."
    >
      <section className="dashboard-kpi-grid">
        <KpiCard label="Captured leads" value={metrics.total} detail="Current reporting period" />
        <KpiCard label="Qualified" value={metrics.qualified} detail="Ready for closer review" />
        <KpiCard label="Verified" value={metrics.verified} detail="Inbox-confirmed demand" />
        <KpiCard label="Avg score" value={`${metrics.averageScore}/100`} detail="Lead quality" />
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <article className="dashboard-card dashboard-card-large">
          <div className="dashboard-card-header">
            <div>
              <span>{report.period}</span>
              <h2>Executive summary</h2>
            </div>
          </div>
          <p>{report.summary}</p>
        </article>
        <article className="dashboard-card">
          <span>Recommended decision</span>
          <h2>Keep human approval on</h2>
          <p>Use AI to draft and rank opportunities, but keep sends and claims reviewed until suppression and consent workflows are stronger.</p>
        </article>
      </section>

      <section className="dashboard-report-grid">
        <ReportList title="Wins" items={report.wins} />
        <ReportList title="Risks" items={report.risks} />
        <ReportList title="Next tests" items={report.nextTests} />
      </section>
    </DashboardShell>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
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
