import Link from "next/link";
import { DashboardShell, KpiCard, StatusBadge } from "@/components/DashboardShell";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const { campaigns, metrics } = await getDashboardData();
  const active = campaigns.filter((campaign) => campaign.status === "Active").length;
  const learning = campaigns.filter((campaign) => campaign.status === "Learning").length;

  return (
    <DashboardShell
      active="/campaigns"
      title="Campaigns"
      description="Campaign-level performance for each lead magnet, waitlist, alpha, and market education path."
    >
      <section className="dashboard-kpi-grid">
        <KpiCard label="Campaigns" value={campaigns.length} detail="Configured FanFactors paths" />
        <KpiCard label="Active" value={active} detail="Enough lead signal to inspect" />
        <KpiCard label="Learning" value={learning} detail="Early traffic, more data needed" />
        <KpiCard label="Best source" value={metrics.bestCampaign} detail="Most captured demand" />
      </section>

      <section className="dashboard-campaign-grid">
        {campaigns.map((campaign) => (
          <article key={campaign.slug} className="dashboard-card dashboard-campaign-card">
            <div className="dashboard-card-header">
              <div>
                <span>{campaign.audience}</span>
                <h2>{campaign.title}</h2>
              </div>
              <StatusBadge tone={campaign.status === "Active" ? "good" : campaign.status === "Learning" ? "warn" : "neutral"}>
                {campaign.status}
              </StatusBadge>
            </div>
            <div className="dashboard-campaign-stats">
              <div>
                <span>Leads</span>
                <strong>{campaign.leads}</strong>
              </div>
              <div>
                <span>Verified</span>
                <strong>{campaign.verified}</strong>
              </div>
              <div>
                <span>Avg score</span>
                <strong>{campaign.averageScore}</strong>
              </div>
            </div>
            <p>{campaign.conversionSignal}</p>
            <Link className="dashboard-text-link" href={campaign.path}>
              View landing page
            </Link>
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}
