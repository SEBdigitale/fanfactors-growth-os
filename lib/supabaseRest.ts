import type { Lead } from "@/lib/types";
import type { LeadEvent } from "@/lib/events";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

function tableUrl(table: string, query = "") {
  if (!supabaseUrl) throw new Error("SUPABASE_URL is not configured.");
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/rest/v1/${table}${query}`;
}

async function supabaseRequest<T>(table: string, init: RequestInit, query = ""): Promise<T> {
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");

  const response = await fetch(tableUrl(table, query), {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      ...init.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Supabase ${table} request failed: ${response.status} ${message}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function leadToRow(lead: Lead) {
  return {
    id: lead.id,
    created_at: lead.createdAt,
    campaign_slug: lead.campaignSlug,
    campaign_path: lead.campaignPath,
    name: lead.name,
    email: lead.email,
    role: lead.role,
    goal: lead.goal,
    source: lead.source,
    score: lead.score,
    status: lead.status,
    tags: lead.tags,
    utm: lead.utm,
    next_url: lead.nextUrl,
    metadata: lead.metadata || {}
  };
}

export function rowToLead(row: Record<string, any>): Lead {
  return {
    id: row.id,
    createdAt: row.created_at,
    campaignSlug: row.campaign_slug,
    campaignPath: row.campaign_path,
    name: row.name,
    email: row.email,
    role: row.role,
    goal: row.goal,
    source: row.source,
    score: row.score,
    status: row.status,
    tags: row.tags || [],
    utm: row.utm || {},
    nextUrl: row.next_url,
    metadata: row.metadata || {}
  };
}

export function eventToRow(event: LeadEvent) {
  return {
    id: event.id,
    created_at: event.createdAt,
    lead_id: event.leadId,
    event: event.event,
    metadata: event.metadata
  };
}

export function rowToEvent(row: Record<string, any>): LeadEvent {
  return {
    id: row.id,
    createdAt: row.created_at,
    leadId: row.lead_id,
    event: row.event,
    metadata: row.metadata || {}
  };
}

export async function insertLeadRow(lead: Lead) {
  const rows = await supabaseRequest<Record<string, any>[]>(
    "leads",
    {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify(leadToRow(lead))
    }
  );

  return rowToLead(rows[0]);
}

export async function selectLeadRows() {
  const rows = await supabaseRequest<Record<string, any>[]>("leads", { method: "GET" }, "?select=*&order=created_at.desc");
  return rows.map(rowToLead);
}

export async function selectLeadRowsByReportToken(token: string) {
  const query = `?select=*&metadata->>report_token=eq.${encodeURIComponent(token)}&limit=1`;
  const rows = await supabaseRequest<Record<string, any>[]>("leads", { method: "GET" }, query);
  return rows.map(rowToLead);
}

export async function updateLeadRowMetadata(leadId: string, metadata: Record<string, unknown>) {
  const rows = await supabaseRequest<Record<string, any>[]>(
    "leads",
    {
      method: "PATCH",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({ metadata })
    },
    `?id=eq.${encodeURIComponent(leadId)}`
  );

  return rowToLead(rows[0]);
}

export async function insertLeadEventRow(event: LeadEvent) {
  const rows = await supabaseRequest<Record<string, any>[]>(
    "lead_events",
    {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify(eventToRow(event))
    }
  );

  return rowToEvent(rows[0]);
}

export async function selectLeadEventRows() {
  const rows = await supabaseRequest<Record<string, any>[]>(
    "lead_events",
    { method: "GET" },
    "?select=*&order=created_at.desc"
  );
  return rows.map(rowToEvent);
}
