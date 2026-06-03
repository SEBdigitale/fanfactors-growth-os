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
  const agents = agentRuns.length ? agentRuns : createAgentRunState(leads);
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

export function createAgentRunState(leads: Lead[]): AgentRun[] {
  const now = new Date().toISOString();
  const qualified = leads.filter((lead) => lead.status === "qualified").length;
  const verified = leads.filter((lead) => lead.metadata?.email_verified_at).length;

  return [
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
