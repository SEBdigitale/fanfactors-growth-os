import Link from "next/link";
import Image from "next/image";

export default function ArtistThankYouPage({
  searchParams
}: {
  searchParams: { campaign?: string; lead_id?: string; next?: string };
}) {
  const nextUrl = searchParams.next || "https://fanfaktors.com/signup?persona=artist";
  const leadId = searchParams.lead_id;
  const campaign = searchParams.campaign;
  const copy =
    campaign === "alpha"
      ? {
          badge: "Alpha request saved",
          title: "Check your inbox for the next step.",
          body: "Your FanFactors Alpha request is in. Open the email to confirm where we should send early access updates.",
          stepOne: "Look for a message from FanFactors with your Alpha confirmation.",
          stepTwoTitle: "Watch for access",
          stepTwoBody: "Early access opens in waves for artists, fans, managers, and music builders.",
          stepThreeBody: "Your FanFactors link keeps the right path attached.",
          backHref: "/alpha"
        }
      : campaign === "new-music-economy"
        ? {
            badge: "Brief request saved",
            title: "Check your inbox for the next step.",
            body: "Your FanFactors music economy brief request is in. Open the email to continue from the right link.",
            stepOne: "Look for a message from FanFactors with your confirmation link.",
            stepTwoTitle: "Read the brief",
            stepTwoBody: "Use it to understand access, rights, and why fan identity matters now.",
            stepThreeBody: "Your FanFactors link keeps the right path attached.",
            backHref: "/new-music-economy"
          }
        : {
            badge: "Request confirmed",
            title: "Check your inbox to get the report.",
            body: "Your FanFactors artist report is on its way. Open the email and use the link inside to access the guide.",
            stepOne: "Look for a message from FanFactors with your report link.",
            stepTwoTitle: "Read the report",
            stepTwoBody: "Use it to map your next release, rights, and repeat revenue strategy.",
            stepThreeBody: "Your FanFactors link keeps the artist path attached.",
            backHref: "/artist-lead-magnet"
          };

  return (
    <main className="leadmagnet-page artist-check-page">
      <div className="leadmagnet-glow" />
      <div className="leadmagnet-grid-bg" />

      <section className="artist-check-shell">
        <div className="artist-check-card">
          <div className="artist-check-image">
            <Image
              src="/images/artist-check-inbox.png"
              alt="Artist checking their inbox for the FanFactors report"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 50vw"
              className="artist-check-photo"
            />
            <div className="artist-check-image-fade" />
            <div className="leadmagnet-badge">
              <div className="leadmagnet-logo-dot">
                <Image src="/images/fanfactors-logo.jpg" alt="FanFactors logo" fill className="leadmagnet-logo-image" />
              </div>
              <div>
                <p>FanFactors</p>
                <span>Artist Growth File</span>
              </div>
            </div>
          </div>

          <div className="artist-check-message">
            <Image src="/images/fanfactors-logo.jpg" alt="" width={220} height={190} className="leadmagnet-watermark" />
            <div className="artist-check-copy">
              <div className="leadmagnet-pill">{copy.badge}</div>
              <h1>{copy.title}</h1>
              <p>{copy.body}</p>

              <div className="artist-thanks-steps" aria-label="Next steps">
                <div>
                  <span>01</span>
                  <strong>Open your email</strong>
                  <p>{copy.stepOne}</p>
                </div>
                <div>
                  <span>02</span>
                  <strong>{copy.stepTwoTitle}</strong>
                  <p>{copy.stepTwoBody}</p>
                </div>
                <div>
                  <span>03</span>
                  <strong>Continue when ready</strong>
                  <p>{copy.stepThreeBody}</p>
                </div>
              </div>

              <div className="thanks-actions">
                <Link className="primary-link" href={nextUrl}>
                  Continue to FanFactors
                </Link>
                <Link className="secondary-link" href={copy.backHref}>
                  Back
                </Link>
              </div>

              {leadId ? <p className="artist-thanks-ref">Reference: {leadId}</p> : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
