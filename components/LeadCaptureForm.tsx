"use client";

import { useMemo, useState } from "react";
import type { Campaign } from "@/lib/types";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function LeadCaptureForm({ campaign }: { campaign: Campaign }) {
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  const attribution = useMemo(() => {
    const empty = {
      campaignUrl: "",
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_content: "",
      utm_term: ""
    };
    if (typeof window === "undefined") return empty;
    const params = new URLSearchParams(window.location.search);
    return {
      campaignUrl: window.location.href,
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || ""
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...payload,
          campaignSlug: campaign.slug,
          campaignPath: campaign.path,
          thankYouPath: campaign.thankYouPath,
          nextUrl: campaign.nextUrl,
          ...attribution
        })
      });

      const result = (await response.json()) as { ok: boolean; redirectTo?: string; error?: string };

      if (!response.ok || !result.ok || !result.redirectTo) {
        throw new Error(result.error || "Lead capture failed.");
      }

      setState("success");
      window.location.href = result.redirectTo;
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <div>
        <h2>{campaign.formTitle}</h2>
        <p>{campaign.formDescription}</p>
      </div>

      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" autoComplete="name" required />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="field">
        <label htmlFor="role">Role</label>
        <select id="role" name="role" required defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          <option>Artist</option>
          <option>Fan</option>
          <option>Manager</option>
          <option>Label</option>
          <option>Partner</option>
          <option>Operator</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="goal">What do you want from FanFactors?</label>
        <textarea id="goal" name="goal" required />
      </div>

      <div className="field">
        <label htmlFor="source">Where did you find this?</label>
        <input id="source" name="source" autoComplete="off" />
      </div>

      <button className="submit-button" type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Saving..." : "Get access"}
      </button>

      {state === "error" ? <div className="form-error">{error}</div> : null}
      {state === "success" ? <div className="form-success">Saved. Sending you to the next step...</div> : null}
      <div className="form-note">We will use this to send the right next step. No spam.</div>
    </form>
  );
}
