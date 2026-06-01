import Link from "next/link";
import Image from "next/image";

export default function FanThankYouPage({
  searchParams
}: {
  searchParams: { campaign?: string; lead_id?: string; next?: string };
}) {
  const nextUrl = searchParams.next || "https://fanfaktors.com/alpha";
  const leadId = searchParams.lead_id;
  const isWaitlist = searchParams.campaign === "fan-waitlist";
  const copy = isWaitlist
    ? {
        badge: "Fan access request saved",
        title: "Check your inbox for the next step.",
        body: "Your FanFactors fan access request is in. Open the email to confirm where we should send early access updates.",
        stepOne: "Look for a message from FanFactors with your fan access confirmation.",
        stepTwoTitle: "Watch for your lane",
        stepTwoBody: "We will use your music taste to send the right drops, artists, and early access updates.",
        stepThreeBody: "Your FanFactors link keeps the fan path attached.",
        backHref: "/fan-waitlist"
      }
    : {
        badge: "Request confirmed",
        title: "Check your inbox to get the report.",
        body: "Your FanFactors fan report is on its way. Open the email and use the link inside to access the guide.",
        stepOne: "Look for a message from FanFactors with your fan report link.",
        stepTwoTitle: "Read the report",
        stepTwoBody: "Use it to understand fan access, artist support, and the new music economy.",
        stepThreeBody: "Your FanFactors link keeps the fan path attached.",
        backHref: "/fan-lead-magnet"
      };

  return (
    <main className="leadmagnet-page artist-check-page">
      <div className="leadmagnet-glow fan-leadmagnet-glow" />
      <div className="leadmagnet-grid-bg" />

      <section className="artist-check-shell">
        <div className="artist-check-card">
          <div className="artist-check-image">
            <Image
              src="/images/fan-check-inbox.png"
              alt="Fan checking their inbox for the FanFactors report"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 50vw"
              className="artist-check-photo fan-check-photo"
            />
            <div className="artist-check-image-fade" />
            <div className="leadmagnet-badge">
              <div className="leadmagnet-logo-dot">
                <Image src="/images/fanfactors-logo.jpg" alt="FanFactors logo" fill className="leadmagnet-logo-image" />
              </div>
              <div>
                <p>FanFactors</p>
                <span>Fan Growth File</span>
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
