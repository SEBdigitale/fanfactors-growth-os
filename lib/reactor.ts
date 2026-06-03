import type { Lead, LeadStatus } from "@/lib/types";

export type ReactorConfig = {
  clientName: string;
  systemName: string;
  internalProductName: string;
  industry: string;
  offerType: string;
  primaryGoal: string;
  targetMarkets: string[];
  excludedLeads: string[];
  funnelUrls: Record<string, string>;
  toneOfVoice: string[];
  approvedClaims: string[];
  bannedClaims: string[];
  humanApprovalRequired: string[];
  cadence: {
    maxEmailsPerLeadPerWeek: number;
    maxFollowupsPerSequence: number;
  };
  scoringRules: Array<{
    factor: string;
    signal: string;
    weight: number;
  }>;
};

export const fanFactorsReactorConfig: ReactorConfig = {
  clientName: "FanFactors",
  systemName: "MC2 Lead Reactor",
  internalProductName: "FanFactors Artist Reactor",
  industry: "music technology",
  offerType: "artist reports, fan reports, market education, and alpha access",
  primaryGoal: "Acquire qualified artists, fans, music builders, and early access prospects.",
  targetMarkets: [
    "Independent artists",
    "Music producers",
    "Artist managers",
    "Small labels",
    "Music fans who discover artists early",
    "Playlist builders",
    "Music entrepreneurs"
  ],
  excludedLeads: [
    "Minors",
    "Duplicate contacts",
    "Unsubscribed contacts",
    "Competitors",
    "Inactive accounts",
    "Contacts with no clear music interest"
  ],
  funnelUrls: {
    artistReport: "/artist-lead-magnet",
    fanReport: "/fan-lead-magnet",
    fanWaitlist: "/fan-waitlist",
    alphaInvite: "/alpha",
    newMusicEconomy: "/new-music-economy"
  },
  toneOfVoice: ["bold", "direct", "clear", "artist-first", "rebellious without hype"],
  approvedClaims: [
    "FanFactors helps artists explore new ways to monetize music access.",
    "Fans can get closer to artists through early access, drops, and participation.",
    "FanFactors is preparing alpha access in waves."
  ],
  bannedClaims: [
    "Guaranteed income",
    "Guaranteed profit",
    "Risk-free investment",
    "Official investment opportunity",
    "Guaranteed resale earnings"
  ],
  humanApprovalRequired: [
    "First campaign launch",
    "New outbound sequence",
    "Financial or earnings claims",
    "High-volume sends",
    "New lead source",
    "Any reply that sounds legally or commercially sensitive"
  ],
  cadence: {
    maxEmailsPerLeadPerWeek: 2,
    maxFollowupsPerSequence: 4
  },
  scoringRules: [
    { factor: "Artist fit", signal: "Artist, producer, manager, label, or music builder role", weight: 25 },
    { factor: "Fan fit", signal: "Fan asks for early drops, artist access, or discovery", weight: 20 },
    { factor: "Intent", signal: "Requests a report, alpha access, or FanFactors signup next step", weight: 20 },
    { factor: "Useful context", signal: "Provides project, genre, platform, or clear goal details", weight: 15 },
    { factor: "Campaign source", signal: "Arrives through a focused campaign or tracked UTM", weight: 10 },
    { factor: "Email verification", signal: "Clicks the gated report link from inbox", weight: 10 }
  ]
};

export function getLeadStatusLabel(status: LeadStatus) {
  const labels: Record<LeadStatus, string> = {
    new: "New",
    qualified: "Qualified",
    nurture: "Nurture",
    suppressed: "Suppressed"
  };

  return labels[status];
}

export function getReactorMetrics(leads: Lead[]) {
  const total = leads.length;
  const qualified = leads.filter((lead) => lead.status === "qualified").length;
  const nurture = leads.filter((lead) => lead.status === "nurture").length;
  const hot = leads.filter((lead) => lead.score >= 80).length;
  const warm = leads.filter((lead) => lead.score >= 60 && lead.score < 80).length;
  const verified = leads.filter((lead) => Boolean(lead.metadata?.email_verified_at)).length;
  const campaigns = new Set(leads.map((lead) => lead.campaignSlug)).size;
  const averageScore = total ? Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / total) : 0;

  const campaignCounts = leads.reduce<Record<string, number>>((counts, lead) => {
    counts[lead.campaignSlug] = (counts[lead.campaignSlug] || 0) + 1;
    return counts;
  }, {});

  const bestCampaign =
    Object.entries(campaignCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "No campaign data yet";

  return {
    total,
    qualified,
    nurture,
    hot,
    warm,
    verified,
    campaigns,
    averageScore,
    bestCampaign
  };
}

export function getCampaignHealth(leads: Lead[]) {
  const metrics = getReactorMetrics(leads);

  if (metrics.total === 0) {
    return {
      label: "Waiting for data",
      score: 0,
      recommendation: "Send test traffic through the artist and fan lead magnets so the reactor has real signals."
    };
  }

  const qualifiedRate = metrics.qualified / metrics.total;
  const verifiedRate = metrics.verified / metrics.total;
  const score = Math.min(100, Math.round(metrics.averageScore * 0.55 + qualifiedRate * 25 + verifiedRate * 20));

  if (score >= 75) {
    return {
      label: "Healthy",
      score,
      recommendation: "Keep routing traffic into the strongest campaign and review high-score leads for follow-up."
    };
  }

  if (score >= 45) {
    return {
      label: "Needs optimization",
      score,
      recommendation: "Tighten campaign source quality and review nurture leads for stronger next-step offers."
    };
  }

  return {
    label: "Early signal",
    score,
    recommendation: "Collect more verified inbox clicks and improve the offer angle for low-score campaigns."
  };
}
