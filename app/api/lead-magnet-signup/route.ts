import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/campaigns";
import { scoreLead, statusForScore, tagsForLead } from "@/lib/leadScoring";
import { writeLead } from "@/lib/leads";
import { sendReportEmail } from "@/lib/email";
import { absoluteUrl, createReportToken, reportDownloadPath } from "@/lib/reportTokens";
import type { Lead } from "@/lib/types";

const requiredFields = ["firstName", "email", "artistName", "role", "genre", "audienceSize", "mainPlatform", "goal"];

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildTrackedUrl(baseUrl: string, leadId: string) {
  const url = new URL(baseUrl);
  url.searchParams.set("lead_id", leadId);
  url.searchParams.set("utm_campaign", "artist-lead-magnet");
  url.searchParams.set("utm_source", "growth_os");
  return url.toString();
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ ok: false, message: "Invalid submission." }, { status: 400 });
  }

  const missingField = requiredFields.find((field) => !asString(body[field]));

  if (missingField) {
    return NextResponse.json({ ok: false, message: "Please complete all required fields." }, { status: 400 });
  }

  const email = asString(body.email).toLowerCase();
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailLooksValid) {
    return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });
  }

  if (body.consent !== true) {
    return NextResponse.json({ ok: false, message: "Consent is required before receiving the guide." }, { status: 400 });
  }

  const campaign = getCampaign("artist-lead-magnet");

  if (!campaign) {
    return NextResponse.json({ ok: false, message: "Campaign is not configured." }, { status: 500 });
  }

  const id = crypto.randomUUID();
  const reportToken = createReportToken();
  const downloadUrl = absoluteUrl(request, reportDownloadPath("artist", reportToken));
  const role = asString(body.role);
  const goal = [
    `Lead magnet: ${asString(body.leadMagnet) || "Transform Your Music Into an Infinite Repeat Business"}`,
    `Artist/project: ${asString(body.artistName)}`,
    `Genre: ${asString(body.genre)}`,
    `Audience: ${asString(body.audienceSize)}`,
    `Main platform: ${asString(body.mainPlatform)}`,
    `Biggest goal: ${asString(body.goal)}`,
    asString(body.musicLink) ? `Music/social link: ${asString(body.musicLink)}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  const score = scoreLead({
    role,
    goal,
    source: `${asString(body.mainPlatform)} ${asString(body.musicLink)}`
  });
  const nextUrl = buildTrackedUrl(campaign.nextUrl, id);

  const lead: Lead = {
    id,
    createdAt: new Date().toISOString(),
    campaignSlug: campaign.slug,
    campaignPath: campaign.path,
    name: `${asString(body.firstName)} (${asString(body.artistName)})`,
    email,
    role,
    goal,
    source: asString(body.mainPlatform),
    score,
    status: statusForScore(score),
    tags: [
      ...tagsForLead({ campaignSlug: campaign.slug, role, goal, score }),
      asString(body.genre).toLowerCase(),
      asString(body.audienceSize).toLowerCase(),
      asString(body.mainPlatform).toLowerCase()
    ].filter(Boolean),
    utm: {
      source: asString(body.utmSource),
      medium: asString(body.utmMedium),
      campaign: asString(body.utmCampaign),
      content: asString(body.utmContent),
      term: asString(body.utmTerm)
    },
    nextUrl,
    metadata: {
      report_type: "artist",
      report_token: reportToken,
      report_url: downloadUrl
    }
  };

  await writeLead(lead);

  await sendReportEmail({
    to: email,
    firstName: asString(body.firstName),
    reportType: "artist",
    downloadUrl
  });

  const webhookUrl = process.env.LEAD_MAGNET_WEBHOOK_URL;

  if (webhookUrl) {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...body,
        email,
        leadId: id,
        submittedAt: lead.createdAt,
        downloadUrl,
        nextUrl
      })
    });

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { ok: false, message: "The lead capture service did not accept the submission." },
        { status: 502 }
      );
    }
  }

  const redirectTo = `${campaign.thankYouPath}?lead_id=${encodeURIComponent(id)}&next=${encodeURIComponent(nextUrl)}`;

  return NextResponse.json({ ok: true, leadId: id, nextUrl, redirectTo });
}
