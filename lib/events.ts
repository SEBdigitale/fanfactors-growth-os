import { promises as fs } from "fs";
import path from "path";
import { hasSupabaseConfig, insertLeadEventRow, selectLeadEventRows } from "@/lib/supabaseRest";

export type LeadEvent = {
  id: string;
  createdAt: string;
  leadId: string;
  event: string;
  metadata: Record<string, unknown>;
};

const dataDir = path.join(process.cwd(), "data");
const eventsPath = path.join(dataDir, "lead_events.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(eventsPath);
  } catch {
    await fs.writeFile(eventsPath, "[]", "utf8");
  }
}

export async function readLeadEvents(): Promise<LeadEvent[]> {
  if (hasSupabaseConfig()) {
    return selectLeadEventRows();
  }

  await ensureStore();
  const raw = await fs.readFile(eventsPath, "utf8");
  return JSON.parse(raw) as LeadEvent[];
}

export async function writeLeadEvent(event: LeadEvent) {
  if (hasSupabaseConfig()) {
    return insertLeadEventRow(event);
  }

  const events = await readLeadEvents();
  events.unshift(event);
  await fs.writeFile(eventsPath, `${JSON.stringify(events, null, 2)}\n`, "utf8");
  return event;
}
