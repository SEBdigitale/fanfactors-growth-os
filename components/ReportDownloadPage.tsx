import Link from "next/link";
import { findLeadByReportToken, markLeadEmailVerified } from "@/lib/leads";
import type { ReportType } from "@/lib/reportTokens";

const reportCopy = {
  artist: {
    eyebrow: "Artist report unlocked",
    title: "Your artist report is ready.",
    body: "Use this guide to think through release strategy, music rights, fan-powered sales, and repeat revenue.",
    reportLabel: "Open artist report",
    fallbackCta: "Continue to FanFactors",
    fallbackUrl: "https://fanfaktors.com/signup?persona=artist"
  },
  fan: {
    eyebrow: "Fan report unlocked",
    title: "Your fan report is ready.",
    body: "Use this guide to understand fan access, artist support, drops, rewards, and the new music economy.",
    reportLabel: "Open fan report",
    fallbackCta: "Continue to FanFactors",
    fallbackUrl: "https://fanfaktors.com/alpha"
  }
};

export async function ReportDownloadPage({ token, reportType }: { token: string; reportType: ReportType }) {
  const lead = await findLeadByReportToken(token);
  const expectedType = lead?.metadata?.report_type;

  if (!lead || expectedType !== reportType) {
    return (
      <main className="download-page">
        <section className="download-panel">
          <p className="eyebrow">Link unavailable</p>
          <h1>This report link is not valid.</h1>
          <p>Use the latest link from your FanFactors email, or request the report again.</p>
          <Link className="primary-link" href={reportType === "artist" ? "/artist-lead-magnet" : "/fan-lead-magnet"}>
            Request the report
          </Link>
        </section>
      </main>
    );
  }

  await markLeadEmailVerified(lead);
  const copy = reportCopy[reportType];
  const reportHref = reportType === "artist" ? "/reports/artist-report.pdf" : "/reports/fan-report.pdf";

  return (
    <main className="download-page">
      <section className="download-panel">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <div className="thanks-actions">
          <Link className="primary-link" href={reportHref}>
            {copy.reportLabel}
          </Link>
          <Link className="secondary-link" href={lead.nextUrl || copy.fallbackUrl}>
            {copy.fallbackCta}
          </Link>
        </div>
        <p className="artist-thanks-ref">Reference: {lead.id}</p>
      </section>
    </main>
  );
}
