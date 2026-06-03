import { campaigns } from "@/lib/campaigns";
import { readLeadEvents } from "@/lib/events";
import { readLeads } from "@/lib/leads";
import { readAgentRuns, readMessageDrafts, type AgentRun, type MessageDraft } from "@/lib/operations";
import { fanFactorsReactorConfig, getCampaignHealth, getReactorMetrics } from "@/lib/reactor";
import type { CampaignSlug, Lead } from "@/lib/types";

export type DashboardCampaign = {
  slug: CampaignSlug;
  audience: string;
  title: string;
  path: string;
  leads: number;
  verified: number;
  averageScore: number;
  conversionSignal: string;
  status: string;
};

export type DashboardReport = {
  period: string;
  summary: string;
  wins: string[];
  risks: string[];
  nextTests: string[];
};

export type DashboardAgent = AgentRun & {
  group: "Strategy" | "Lead Engine" | "Campaign Engine" | "Pipeline" | "Growth Loop";
  shortName: string;
  purpose: string;
  order: number;
};

export async function getDashboardData() {
  const [leads, events, messageDrafts, agentRuns] = await Promise.all([
    readLeads(),
    readLeadEvents(),
    readMessageDrafts(),
    readAgentRuns()
  ]);

  const metrics = getReactorMetrics(leads);
  const health = getCampaignHealth(leads);
  const dashboardCampaigns = getDashboardCampaigns(leads);
  const approvals = messageDrafts.length ? messageDrafts : createSuggestedDrafts(leads);
  const agents = createAgentRunState(leads, agentRuns);
  const report = createWeeklyReport(leads);

  return {
    leads,
    events,
    approvals,
    agents,
    campaigns: dashboardCampaigns,
    config: fanFactorsReactorConfig,
    health,
    metrics,
    report
  };
}

export function getDashboardCampaigns(leads: Lead[]): DashboardCampaign[] {
  return campaigns.map((campaign) => {
    const campaignLeads = leads.filter((lead) => lead.campaignSlug === campaign.slug);
    const verified = campaignLeads.filter((lead) => lead.metadata?.email_verified_at).length;
    const averageScore = campaignLeads.length
      ? Math.round(campaignLeads.reduce((sum, lead) => sum + lead.score, 0) / campaignLeads.length)
      : 0;

    return {
      slug: campaign.slug,
      audience: campaign.audience,
      title: campaign.title,
      path: campaign.path,
      leads: campaignLeads.length,
      verified,
      averageScore,
      conversionSignal: campaignLeads.length ? `${verified}/${campaignLeads.length} inbox verified` : "No signal yet",
      status: campaignLeads.length >= 5 ? "Active" : campaignLeads.length > 0 ? "Learning" : "Ready"
    };
  });
}

export function createSuggestedDrafts(leads: Lead[]): MessageDraft[] {
  return leads.slice(0, 6).map((lead, index) => ({
    id: `suggested-${lead.id}`,
    createdAt: lead.createdAt,
    leadId: lead.id,
    channel: index % 2 === 0 ? "email" : "follow-up",
    subject: lead.campaignSlug === "artist-lead-magnet" ? "Your artist report is ready" : "Your FanFactors access path",
    body:
      lead.campaignSlug === "artist-lead-magnet"
        ? `Hey ${lead.name}, your artist report is ready. The fastest next step is to map one release into a direct fan-access offer before the next campaign starts.`
        : `Hey ${lead.name}, based on what you told us, FanFactors should route you toward early drops and artist access before the wider public hears about them.`,
    status: "needs_review",
    approvedAt: null,
    sentAt: null
  }));
}

const agentDefinitions: Omit<DashboardAgent, keyof AgentRun>[] = [
  {
    group: "Strategy",
    shortName: "Strategy Architect",
    purpose: "Creates the campaign blueprint, offer logic, funnel route, and qualification rules.",
    order: 1
  },
  {
    group: "Strategy",
    shortName: "ICP Builder",
    purpose: "Turns the client business into ideal customer profiles, negative profiles, triggers, and objections.",
    order: 2
  },
  {
    group: "Lead Engine",
    shortName: "Lead Discovery",
    purpose: "Finds leads from approved sources while respecting privacy, consent, and platform rules.",
    order: 3
  },
  {
    group: "Lead Engine",
    shortName: "Lead Enrichment",
    purpose: "Adds useful context, removes duplicates, and flags weak or risky records.",
    order: 4
  },
  {
    group: "Lead Engine",
    shortName: "Qualification and Scoring",
    purpose: "Scores leads from 0 to 100 and separates hot, warm, nurture, low priority, and review records.",
    order: 5
  },
  {
    group: "Campaign Engine",
    shortName: "Personalization",
    purpose: "Creates segment-specific copy, follow-ups, hooks, and objection responses.",
    order: 6
  },
  {
    group: "Campaign Engine",
    shortName: "Campaign Builder",
    purpose: "Turns strategy, audiences, messages, compliance checks, and tracking into campaign flows.",
    order: 7
  },
  {
    group: "Campaign Engine",
    shortName: "Compliance and Reputation",
    purpose: "Blocks spammy behavior, banned claims, duplicate sends, missing unsubscribe, and risky messages.",
    order: 8
  },
  {
    group: "Pipeline",
    shortName: "CRM Pipeline",
    purpose: "Keeps lead stages organized from new and researched through contacted, replied, booked, sold, or suppressed.",
    order: 9
  },
  {
    group: "Pipeline",
    shortName: "Funnel Intelligence",
    purpose: "Tracks visits, opt-ins, clicks, registrations, bookings, purchases, and other behavior signals.",
    order: 10
  },
  {
    group: "Growth Loop",
    shortName: "Optimization",
    purpose: "Finds what to pause, scale, rewrite, test, or improve every week.",
    order: 11
  },
  {
    group: "Growth Loop",
    shortName: "Client Report",
    purpose: "Creates the weekly client brief with wins, risks, next tests, and recommended decisions.",
    order: 12
  }
];

export function createAgentRunState(leads: Lead[], storedRuns: AgentRun[] = []): DashboardAgent[] {
  const now = new Date().toISOString();
  const qualified = leads.filter((lead) => lead.status === "qualified").length;
  const verified = leads.filter((lead) => lead.metadata?.email_verified_at).length;
  const warmOrBetter = leads.filter((lead) => lead.score >= 60).length;
  const storedByName = new Map(storedRuns.map((run) => [run.agentName.replace(/ Agent$/, ""), run]));

  const fallbackRuns: AgentRun[] = [
    {
      id: "strategy-agent",
      createdAt: now,
      leadId: null,
      agentName: "Strategy Architect Agent",
      status: "ready",
      input: { client: "FanFactors" },
      output: { decision: "Prioritize artist report and fan report traffic before outbound campaigns." },
      error: null
    },
    {
      id: "icp-builder-agent",
      createdAt: now,
      leadId: null,
      agentName: "ICP Builder Agent",
      status: "ready",
      input: { client: "FanFactors", segments: ["Artists", "Fans"] },
      output: {
        artistICP: "Independent artists with original music, active audience, and interest in repeat revenue.",
        fanICP: "Music fans who want early access, discovery, rewards, and participation."
      },
      error: null
    },
    {
      id: "lead-discovery-agent",
      createdAt: now,
      leadId: null,
      agentName: "Lead Discovery Agent",
      status: "guarding",
      input: { sources: ["opt-in forms", "approved public sources", "manual uploads"] },
      output: { rule: "Use approved sources only. No reckless scraping or unapproved personal-data collection." },
      error: null
    },
    {
      id: "lead-enrichment-agent",
      createdAt: now,
      leadId: null,
      agentName: "Lead Enrichment Agent",
      status: leads.length ? "active" : "ready",
      input: { leads: leads.length },
      output: { nextAction: "Deduplicate repeated tests and attach visible role, source, and campaign context." },
      error: null
    },
    {
      id: "scoring-agent",
      createdAt: now,
      leadId: null,
      agentName: "Qualification and Scoring Agent",
      status: qualified ? "active" : "watching",
      input: { leads: leads.length },
      output: { qualified, verified },
      error: null
    },
    {
      id: "copy-agent",
      createdAt: now,
      leadId: null,
      agentName: "Personalization Agent",
      status: "needs_review",
      input: { latestLeads: leads.slice(0, 3).map((lead) => lead.id) },
      output: { nextAction: "Draft report follow-ups for verified inbox clicks." },
      error: null
    },
    {
      id: "campaign-builder-agent",
      createdAt: now,
      leadId: null,
      agentName: "Campaign Builder Agent",
      status: "ready",
      input: { campaigns: campaigns.length },
      output: { flow: "Capture, score, segment, draft, compliance check, approve, send or export, track, follow up." },
      error: null
    },
    {
      id: "compliance-agent",
      createdAt: now,
      leadId: null,
      agentName: "Compliance and Reputation Agent",
      status: "guarding",
      input: { region: "Canada / United States" },
      output: { rule: "Human approval required before cold outreach or high-volume sends." },
      error: null
    },
    {
      id: "crm-pipeline-agent",
      createdAt: now,
      leadId: null,
      agentName: "CRM Pipeline Agent",
      status: "active",
      input: { stages: ["New", "Qualified", "Nurture", "Verified", "Suppressed"] },
      output: { tracked: leads.length, warmOrBetter },
      error: null
    },
    {
      id: "funnel-intelligence-agent",
      createdAt: now,
      leadId: null,
      agentName: "Funnel Intelligence Agent",
      status: verified ? "active" : "watching",
      input: { events: ["page_view", "form_submit", "link_click", "download"] },
      output: { verifiedClicks: verified, nextSignal: "Track signup and onboarding events from FanFactors." },
      error: null
    },
    {
      id: "optimization-agent",
      createdAt: now,
      leadId: null,
      agentName: "Optimization Agent",
      status: "scheduled",
      input: { cadence: "weekly" },
      output: { nextAction: "Compare campaign quality, tighten weak copy, and recommend the next test." },
      error: null
    },
    {
      id: "report-agent",
      createdAt: now,
      leadId: null,
      agentName: "Client Report Agent",
      status: "scheduled",
      input: { cadence: "weekly" },
      output: { nextReport: "Friday" },
      error: null
    }
  ];

  return fallbackRuns
    .map((fallback) => {
      const shortName = fallback.agentName.replace(/ Agent$/, "");
      const stored = storedByName.get(shortName);
      const definition = agentDefinitions.find((agent) => agent.shortName === shortName);

      return {
        ...fallback,
        ...stored,
        group: definition?.group ?? "Lead Engine",
        shortName,
        purpose: definition?.purpose ?? "Specialized MC² Lead Reactor operating role.",
        order: definition?.order ?? 99
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function createWeeklyReport(leads: Lead[]): DashboardReport {
  const metrics = getReactorMetrics(leads);
  const health = getCampaignHealth(leads);

  return {
    period: "Current week",
    summary: `${metrics.total} leads captured across ${metrics.campaigns} campaigns. Average lead score is ${metrics.averageScore}/100. Campaign health is ${health.label.toLowerCase()}.`,
    wins: [
      `${metrics.verified} leads have verified inbox activity.`,
      `${metrics.bestCampaign} is producing the strongest current demand signal.`,
      `${metrics.warm + metrics.hot} leads are warm or better based on the current scoring model.`
    ],
    risks: [
      "Admin access should be password protected before broader traffic.",
      "Message approvals are still manual and should remain that way until compliance rules are stronger.",
      "Repeated test submissions should be deduplicated before using the dashboard for client reporting."
    ],
    nextTests: [
      "Add an approved follow-up sequence for verified artist report clicks.",
      "Separate fan report leads from fan waitlist leads in the reporting view.",
      "Create the first outbound-safe message draft and route it through approval."
    ]
  };
}

export function getLeadSegment(lead: Lead) {
  if (lead.score >= 80) return "Hot";
  if (lead.score >= 60) return "Warm";
  if (lead.score >= 40) return "Nurture";
  return "Low priority";
}

export function formatAgentStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getAgentStatusTone(status: string): "neutral" | "good" | "warn" {
  if (["needs_review", "blocked", "guarding"].includes(status)) return "warn";
  if (["active", "ready", "scheduled"].includes(status)) return "good";
  return "neutral";
}
