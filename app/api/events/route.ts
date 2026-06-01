import { NextResponse } from "next/server";
import { writeLeadEvent } from "@/lib/events";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body.lead_id !== "string" || typeof body.event !== "string") {
    return NextResponse.json({ ok: false, error: "lead_id and event are required." }, { status: 400 });
  }

  const event = await writeLeadEvent({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    leadId: body.lead_id,
    event: body.event,
    metadata: Object.fromEntries(Object.entries(body).filter(([key]) => key !== "lead_id" && key !== "event"))
  });

  return NextResponse.json({
    ok: true,
    event
  });
}
