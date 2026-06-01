import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/campaigns";
import { scoreLead, statusForScore, tagsForLead } from "@/lib/leadScoring";
import { writeLead } from "@/lib/leads";
import { sendReportEmail } from "@/lib/email";
import { absoluteUrl, createReportToken, reportDownloadPath } from "@/lib/reportTokens";
import type { Lead } from "@/lib/types";

const requiredFields = ["firstName", "email", "favoriteArtist", "fanType", "favoriteGenre", "discoveryPlatform", "fanGoal"];

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildTrackedUrl(baseUrl: string, leadId: string) {
  const url = new URL(baseUrl);
  url.searchParams.set("lead_id", leadId);
  url.searchParams.set("utm_campaign", "fan-lead-magnet");
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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });
  }

  if (body.consent !== true) {
    return NextResponse.json({ ok: false, message: "Consent is required before receiving the report." }, { status: 400 });
  }

  const campaign = getCampaign("fan-lead-magnet");

  if (!campaign) {
    return NextResponse.json({ ok: false, message: "Campaign is not configured." }, { status: 500 });
  }

  const id = crypto.randomUUID();
  const reportToken = createReportToken();
  const downloadUrl = absoluteUrl(request, reportDownloadPath("fan", reportToken));
  const role = asString(body.fanType);
  const goal = [
    `Lead magnet: ${asString(body.leadMagnet) || "Your Side of the New Music Economy"}`,
    `Favorite artist: ${asString(body.favoriteArtist)}`,
    `Favorite genre / scene: ${asString(body.favoriteGenre)}`,
    `Discovery platform: ${asString(body.discoveryPlatform)}`,
    `Fan goal: ${asString(body.fanGoal)}`,
    asString(body.city) ? `City / scene: ${asString(body.city)}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  const score = scoreLead({
    role: `Fan ${role}`,
    goal,
    source: `${asString(body.discoveryPlatform)} ${asString(body.favoriteArtist)}`
  });
  const nextUrl = buildTrackedUrl(campaign.nextUrl, id);

  const tags = Array.from(
    new Set(
      [
        ...tagsForLead({ campaignSlug: campaign.slug, role: `Fan ${role}`, goal, score }).filter((tag) => tag !== "artist"),
        "fan",
        asString(body.favoriteGenre).toLowerCase(),
        asString(body.discoveryPlatform).toLowerCase(),
        asString(body.fanGoal).toLowerCase()
      ].filter(Boolean)
    )
  );

  const lead: Lead = {
    id,
    createdAt: new Date().toISOString(),
    campaignSlug: campaign.slug,
    campaignPath: campaign.path,
    name: asString(body.firstName),
    email,
    role,
    goal,
    source: asString(body.discoveryPlatform),
    score,
    status: statusForScore(score),
    tags,
    utm: {
      source: asString(body.utmSource),
      medium: asString(body.utmMedium),
      campaign: asString(body.utmCampaign),
      content: asString(body.utmContent),
      term: asString(body.utmTerm)
    },
    nextUrl,
    metadata: {
      report_type: "fan",
      report_token: reportToken,
      report_url: downloadUrl
    }
  };

  await writeLead(lead);

  await sendReportEmail({
    to: email,
    firstName: asString(body.firstName),
    reportType: "fan",
    downloadUrl
  });

  const webhookUrl = process.env.FAN_LEAD_MAGNET_WEBHOOK_URL || process.env.LEAD_MAGNET_WEBHOOK_URL;

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
