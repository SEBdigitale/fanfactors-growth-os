import { DashboardShell, KpiCard, StatusBadge } from "@/components/DashboardShell";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function MessageApprovalPage() {
  const { approvals } = await getDashboardData();
  const needsReview = approvals.filter((draft) => draft.status === "needs_review").length;
  const approved = approvals.filter((draft) => draft.status === "approved").length;

  return (
    <DashboardShell
      active="/messages/approval"
      title="Message Approval Center"
      description="Human review for AI-generated emails, follow-ups, and campaign copy before anything sensitive goes out."
    >
      <section className="dashboard-kpi-grid">
        <KpiCard label="Drafts" value={approvals.length} detail="Current approval inventory" />
        <KpiCard label="Needs review" value={needsReview} detail="Requires human decision" />
        <KpiCard label="Approved" value={approved} detail="Ready for sending workflow" />
        <KpiCard label="Blocked claims" value="5" detail="Configured compliance guardrails" />
      </section>

      <section className="dashboard-approval-list">
        {approvals.map((draft) => (
          <article key={draft.id} className="dashboard-card dashboard-approval-card">
            <div className="dashboard-card-header">
              <div>
                <span>{draft.channel}</span>
                <h2>{draft.subject || "Untitled draft"}</h2>
              </div>
              <StatusBadge tone={draft.status === "needs_review" ? "warn" : "neutral"}>{draft.status}</StatusBadge>
            </div>
            <p>{draft.body}</p>
            <div className="dashboard-approval-actions" aria-label="Approval actions">
              <button type="button">Approve</button>
              <button type="button">Edit</button>
              <button type="button">Reject</button>
            </div>
          </article>
        ))}
        {approvals.length === 0 ? <p className="dashboard-empty">No message drafts waiting for approval.</p> : null}
      </section>
    </DashboardShell>
  );
}
