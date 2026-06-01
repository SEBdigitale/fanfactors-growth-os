import type { LeadStatus } from "@/lib/types";

const highIntentWords = [
  "release",
  "launch",
  "album",
  "single",
  "tour",
  "fans",
  "fanbase",
  "manager",
  "label",
  "catalog",
  "upload",
  "community"
];

export function scoreLead(input: { role: string; goal: string; source: string }) {
  const haystack = `${input.role} ${input.goal} ${input.source}`.toLowerCase();
  let score = 35;

  for (const word of highIntentWords) {
    if (haystack.includes(word)) score += 6;
  }

  if (haystack.includes("artist")) score += 12;
  if (haystack.includes("manager") || haystack.includes("label")) score += 10;
  if (input.goal.length > 120) score += 8;

  return Math.min(score, 100);
}

export function statusForScore(score: number): LeadStatus {
  if (score >= 72) return "qualified";
  if (score >= 45) return "nurture";
  return "new";
}

export function tagsForLead(input: { campaignSlug: string; role: string; goal: string; score: number }) {
  const text = `${input.role} ${input.goal}`.toLowerCase();
  const tags = [input.campaignSlug, input.score >= 72 ? "high-intent" : "needs-nurture"];

  if (text.includes("artist")) tags.push("artist");
  if (text.includes("fan")) tags.push("fan");
  if (text.includes("manager")) tags.push("manager");
  if (text.includes("label")) tags.push("label");
  if (text.includes("release") || text.includes("launch")) tags.push("release-cycle");

  return Array.from(new Set(tags));
}
