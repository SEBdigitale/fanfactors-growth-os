import type { CampaignSlug } from "@/lib/types";

type SendReportEmailInput = {
  to: string;
  firstName: string;
  reportType: "artist" | "fan";
  downloadUrl: string;
};

type SendCampaignEmailInput = {
  to: string;
  name: string;
  campaignSlug: CampaignSlug;
  nextUrl: string;
};

const campaignEmailCopy: Record<CampaignSlug, { subject: string; title: string; body: string; cta: string }> = {
  "artist-lead-magnet": {
    subject: "Your FanFactors artist report is ready",
    title: "Your artist report is ready.",
    body: "Open the secure link below to read the guide.",
    cta: "Open the report"
  },
  "fan-lead-magnet": {
    subject: "Your FanFactors fan report is ready",
    title: "Your fan report is ready.",
    body: "Open the secure link below to read the guide.",
    cta: "Open the report"
  },
  "fan-waitlist": {
    subject: "Your FanFactors fan access request is in",
    title: "You are on the early fan access list.",
    body: "When the right fan lane opens, this is the inbox we will use. You can also continue to the Alpha page now.",
    cta: "Continue to FanFactors"
  },
  alpha: {
    subject: "Your FanFactors Alpha request is in",
    title: "Your Alpha request is in.",
    body: "We received your request. Use the link below to keep moving while early access opens in waves.",
    cta: "Continue to FanFactors"
  },
  "new-music-economy": {
    subject: "Your FanFactors brief request is in",
    title: "Your music economy brief request is in.",
    body: "We received your request. Use the link below to keep reading and see where you fit.",
    cta: "Continue to FanFactors"
  }
};

function subjectFor(reportType: "artist" | "fan") {
  if (reportType === "artist") return "Your FanFactors artist report is ready";
  return "Your FanFactors fan report is ready";
}

function textFor({ firstName, reportType, downloadUrl }: SendReportEmailInput) {
  const reportName = reportType === "artist" ? "artist report" : "fan report";

  return [
    `Hi ${firstName || "there"},`,
    "",
    `Your FanFactors ${reportName} is ready.`,
    "",
    `Open it here: ${downloadUrl}`,
    "",
    "FanFactors"
  ].join("\n");
}

function htmlFor({ firstName, reportType, downloadUrl }: SendReportEmailInput) {
  const reportName = reportType === "artist" ? "artist report" : "fan report";

  return `
    <div style="font-family: Arial, sans-serif; background:#06150d; color:#ffffff; padding:32px;">
      <div style="max-width:560px; margin:0 auto; border:1px solid rgba(149,255,0,.28); border-radius:12px; padding:28px; background:#020502;">
        <p style="color:#95ff00; font-size:12px; font-weight:800; letter-spacing:.14em; text-transform:uppercase;">FanFactors</p>
        <h1 style="font-size:34px; line-height:1.05; margin:0 0 16px;">Your ${reportName} is ready.</h1>
        <p style="color:#d7ded2; font-size:16px; line-height:1.55;">Hi ${firstName || "there"}, open the link below to access your report.</p>
        <p style="margin:28px 0;">
          <a href="${downloadUrl}" style="display:inline-block; background:#95ff00; color:#06150d; font-weight:800; text-decoration:none; padding:14px 18px; border-radius:8px;">Open the report</a>
        </p>
        <p style="color:#94a08d; font-size:13px; line-height:1.45;">If the button does not work, copy and paste this link into your browser:<br>${downloadUrl}</p>
      </div>
    </div>
  `;
}

export async function sendReportEmail(input: SendReportEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { ok: false, skipped: true, reason: "Resend is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: subjectFor(input.reportType),
      text: textFor(input),
      html: htmlFor(input)
    })
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Resend email failed: ${response.status} ${message}`);
  }

  const result = (await response.json()) as { id?: string };
  return { ok: true, id: result.id };
}

export async function sendCampaignEmail(input: SendCampaignEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { ok: false, skipped: true, reason: "Resend is not configured." };
  }

  const copy = campaignEmailCopy[input.campaignSlug];
  const firstName = input.name.split(/\s+/)[0] || "there";

  const text = [
    `Hi ${firstName},`,
    "",
    copy.title,
    "",
    copy.body,
    "",
    input.nextUrl,
    "",
    "FanFactors"
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; background:#06150d; color:#ffffff; padding:32px;">
      <div style="max-width:560px; margin:0 auto; border:1px solid rgba(149,255,0,.28); border-radius:12px; padding:28px; background:#020502;">
        <p style="color:#95ff00; font-size:12px; font-weight:800; letter-spacing:.14em; text-transform:uppercase;">FanFactors</p>
        <h1 style="font-size:34px; line-height:1.05; margin:0 0 16px;">${copy.title}</h1>
        <p style="color:#d7ded2; font-size:16px; line-height:1.55;">Hi ${firstName}, ${copy.body}</p>
        <p style="margin:28px 0;">
          <a href="${input.nextUrl}" style="display:inline-block; background:#95ff00; color:#06150d; font-weight:800; text-decoration:none; padding:14px 18px; border-radius:8px;">${copy.cta}</a>
        </p>
        <p style="color:#94a08d; font-size:13px; line-height:1.45;">If the button does not work, copy and paste this link into your browser:<br>${input.nextUrl}</p>
      </div>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: copy.subject,
      text,
      html
    })
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Resend email failed: ${response.status} ${message}`);
  }

  const result = (await response.json()) as { id?: string };
  return { ok: true, id: result.id };
}
