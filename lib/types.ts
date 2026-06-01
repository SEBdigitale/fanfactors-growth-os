export type CampaignSlug = "artist-lead-magnet" | "fan-lead-magnet" | "fan-waitlist" | "alpha" | "new-music-economy";

export type LeadStatus = "new" | "qualified" | "nurture" | "suppressed";

export type Lead = {
  id: string;
  createdAt: string;
  campaignSlug: CampaignSlug;
  campaignPath: string;
  name: string;
  email: string;
  role: string;
  goal: string;
  source: string;
  score: number;
  status: LeadStatus;
  tags: string[];
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  nextUrl: string;
  metadata?: Record<string, unknown>;
};

export type Campaign = {
  slug: CampaignSlug;
  path: string;
  audience: string;
  title: string;
  description: string;
  formTitle: string;
  formDescription: string;
  thankYouPath: string;
  nextUrl: string;
  heroImage: string;
  signals: Array<{
    title: string;
    body: string;
  }>;
};
