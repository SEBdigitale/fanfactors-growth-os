import { promises as fs } from "fs";
import path from "path";
import {
  hasSupabaseConfig,
  insertLeadRow,
  selectLeadRows,
  selectLeadRowsByReportToken,
  updateLeadRowMetadata
} from "@/lib/supabaseRest";
import type { Lead } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const leadsPath = path.join(dataDir, "leads.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(leadsPath);
  } catch {
    await fs.writeFile(leadsPath, "[]", "utf8");
  }
}

export async function readLeads(): Promise<Lead[]> {
  if (hasSupabaseConfig()) {
    return selectLeadRows();
  }

  await ensureStore();
  const raw = await fs.readFile(leadsPath, "utf8");
  return JSON.parse(raw) as Lead[];
}

export async function writeLead(lead: Lead) {
  if (hasSupabaseConfig()) {
    return insertLeadRow(lead);
  }

  const leads = await readLeads();
  leads.unshift(lead);
  await fs.writeFile(leadsPath, `${JSON.stringify(leads, null, 2)}\n`, "utf8");
  return lead;
}

export async function findLeadByReportToken(token: string) {
  if (hasSupabaseConfig()) {
    const leads = await selectLeadRowsByReportToken(token);
    return leads[0] || null;
  }

  const leads = await readLeads();
  return leads.find((lead) => lead.metadata?.report_token === token) || null;
}

export async function markLeadEmailVerified(lead: Lead) {
  const metadata = {
    ...(lead.metadata || {}),
    email_verified_at: new Date().toISOString()
  };

  if (hasSupabaseConfig()) {
    return updateLeadRowMetadata(lead.id, metadata);
  }

  const leads = await readLeads();
  const updated = leads.map((item) => (item.id === lead.id ? { ...item, metadata } : item));
  await fs.writeFile(leadsPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  return updated.find((item) => item.id === lead.id) || null;
}
