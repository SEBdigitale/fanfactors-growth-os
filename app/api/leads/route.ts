import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/campaigns";
import { sendCampaignEmail } from "@/lib/email";
import { scoreLead, statusForScore, tagsForLead } from "@/lib/leadScoring";
import { writeLead } from "@/lib/leads";
import type { CampaignSlug, Lead } from "@/lib/types";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildTrackedUrl(baseUrl: string, leadId: string, campaignSlug: string) {
  const url = new URL(baseUrl);
  url.searchParams.set("lead_id", leadId);
  url.searchParams.set("utm_campaign", campaignSlug);
  url.searchParams.set("utm_source", "growth_os");
  return url.toString();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const campaignSlug = asString(body.campaignSlug) as CampaignSlug;
    const campaign = getCampaign(campaignSlug);

    if (!campaign) {
      return NextResponse.json({ ok: false, error: "Unknown campaign." }, { status: 400 });
    }

    const name = asString(body.name);
    const email = asString(body.email).toLowerCase();
    const role = asString(body.role);
    const goal = asString(body.goal);
    const source = asString(body.source);

    if (!name || !email || !role || !goal) {
      return NextResponse.json({ ok: false, error: "Name, email, role, and goal are required." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const score = scoreLead({ role, goal, source });
    const nextUrl = buildTrackedUrl(campaign.nextUrl, id, campaign.slug);

    const lead: Lead = {
      id,
      createdAt: new Date().toISOString(),
      campaignSlug: campaign.slug,
      campaignPath: campaign.path,
      name,
      email,
      role,
      goal,
      source,
      score,
      status: statusForScore(score),
      tags: tagsForLead({ campaignSlug: campaign.slug, role, goal, score }),
      utm: {
        source: asString(body.utm_source),
        medium: asString(body.utm_medium),
        campaign: asString(body.utm_campaign),
        content: asString(body.utm_content),
        term: asString(body.utm_term)
      },
      nextUrl
    };

    await writeLead(lead);
    await sendCampaignEmail({
      to: email,
      name,
      campaignSlug: campaign.slug,
      nextUrl
    });

    const redirectTo = `${campaign.thankYouPath}?lead_id=${encodeURIComponent(id)}&campaign=${encodeURIComponent(campaign.slug)}&next=${encodeURIComponent(nextUrl)}`;
    return NextResponse.json({ ok: true, leadId: id, redirectTo });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to save lead." },
      { status: 500 }
    );
  }
}
