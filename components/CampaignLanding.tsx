import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import type { Campaign } from "@/lib/types";

export function CampaignLanding({ campaign }: { campaign: Campaign }) {
  return (
    <main className="landing-shell" style={{ "--hero-image": `url(${campaign.heroImage})` } as React.CSSProperties}>
      <header className="landing-nav">
        <div className="brand" aria-label="FanFactors">
          FanFactors Growth OS
        </div>
      </header>

      <section className="campaign-layout">
        <div className="campaign-copy">
          <p className="eyebrow">{campaign.audience}</p>
          <h1>{campaign.title}</h1>
          <p>{campaign.description}</p>

          <div className="signal-list" aria-label="Growth signals">
            {campaign.signals.map((signal) => (
              <div key={signal.title}>
                <strong>{signal.title}</strong>
                <span>{signal.body}</span>
              </div>
            ))}
          </div>
        </div>

        <LeadCaptureForm campaign={campaign} />
      </section>
    </main>
  );
}
