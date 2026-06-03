import {
  hasSupabaseConfig,
  selectAgentRunRows,
  selectMessageDraftRows,
  type AgentRunRow,
  type MessageDraftRow
} from "@/lib/supabaseRest";

export type MessageDraft = MessageDraftRow;
export type AgentRun = AgentRunRow;

export async function readMessageDrafts(): Promise<MessageDraft[]> {
  if (!hasSupabaseConfig()) return [];

  try {
    return await selectMessageDraftRows();
  } catch {
    return [];
  }
}

export async function readAgentRuns(): Promise<AgentRun[]> {
  if (!hasSupabaseConfig()) return [];

  try {
    return await selectAgentRunRows();
  } catch {
    return [];
  }
}
