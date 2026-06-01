"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const formStart = {
  firstName: "",
  email: "",
  favoriteArtist: "",
  fanType: "",
  favoriteGenre: "",
  discoveryPlatform: "",
  fanGoal: "",
  city: "",
  consent: false,
  utmSource: "direct",
  utmMedium: "none",
  utmCampaign: "none",
  utmContent: "none",
  utmTerm: "none"
};

const fanTypeOptions = [
  "Casual listener",
  "Active fan",
  "Superfan",
  "Collector",
  "Street team / community builder",
  "Music creator too"
];

const platformOptions = ["TikTok", "Instagram", "YouTube", "Spotify", "Apple Music", "SoundCloud", "Bandcamp", "Live shows", "Friends", "Other"];

const goalOptions = [
  "Discover artists earlier",
  "Get access to exclusive drops",
  "Support artists directly",
  "Collect music-related rewards",
  "Join artist communities",
  "Learn about FanFactors Alpha"
];

type FormData = typeof formStart;
type Status = "idle" | "loading" | "success" | "error";

export function FanLeadMagnetLanding() {
  const [formData, setFormData] = useState<FormData>(formStart);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setFormData((current) => ({
      ...current,
      utmSource: params.get("utm_source") || "direct",
      utmMedium: params.get("utm_medium") || "none",
      utmCampaign: params.get("utm_campaign") || "none",
      utmContent: params.get("utm_content") || "none",
      utmTerm: params.get("utm_term") || "none"
    }));
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = event.target;
    const checked = event.target instanceof HTMLInputElement ? event.target.checked : false;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const cleanEmail = formData.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!formData.consent) {
      setStatus("error");
      setErrorMessage("Please confirm that FanFactors can send you the report and Alpha updates.");
      return;
    }

    try {
      const response = await fetch("/api/fan-lead-magnet-signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: cleanEmail,
          leadMagnet: "Your Side of the New Music Economy",
          page: "fan-lead-magnet"
        })
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        redirectTo?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "The form could not be submitted.");
      }

      setStatus("success");
      setFormData((current) => ({
        ...formStart,
        utmSource: current.utmSource,
        utmMedium: current.utmMedium,
        utmCampaign: current.utmCampaign,
        utmContent: current.utmContent,
        utmTerm: current.utmTerm
      }));

      window.location.href = result.redirectTo || "/thank-you/fan";
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="leadmagnet-page fan-leadmagnet-page">
      <div className="leadmagnet-glow fan-leadmagnet-glow" />
      <div className="leadmagnet-grid-bg" />

      <section className="leadmagnet-shell">
        <div className="leadmagnet-card fan-leadmagnet-card">
          <div className="leadmagnet-cover fan-report-stage">
            <Image
              src="/images/fanfactors-fan-lead-magnet-cover.png"
              alt="FanFactors fan-side lead magnet book cover"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 54vw"
              className="leadmagnet-cover-image fan-report-image"
            />
            <div className="leadmagnet-cover-radial" />
            <div className="leadmagnet-cover-sidefade" />
            <div className="leadmagnet-cover-bottomfade" />
            <div className="leadmagnet-cover-topfade" />

            <div className="leadmagnet-badge">
              <div className="leadmagnet-logo-dot">
                <Image src="/images/fanfactors-logo.jpg" alt="FanFactors logo" fill className="leadmagnet-logo-image" />
              </div>
              <div>
                <p>FanFactors</p>
                <span>Fan Growth File</span>
              </div>
            </div>

            <div className="leadmagnet-cover-copy">
              <p>Fan-side lead magnet</p>
              <span>
                Learn how fans can become more than listeners: early discoverers, community builders, collectors, and
                direct supporters of artists.
              </span>
            </div>
          </div>

          <div className="leadmagnet-form-panel">
            <Image src="/images/fanfactors-logo.jpg" alt="" width={220} height={190} className="leadmagnet-watermark" />

            <div className="leadmagnet-form-wrap">
              <div className="leadmagnet-heading">
                <div className="leadmagnet-pill">For fans, superfans & music communities</div>
                <h1>See where fans fit in the next music economy.</h1>
                <p>
                  Get the free FanFactors fan report and learn how discovery, direct support, rewards, resale rights,
                  and artist access can work from the fan side.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="leadmagnet-form">
                <div className="leadmagnet-two">
                  <Field label="First name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Sebastien" required />
                  <Field label="Email address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" required />
                </div>

                <div className="leadmagnet-two">
                  <Field label="Favorite artist right now" name="favoriteArtist" value={formData.favoriteArtist} onChange={handleChange} placeholder="Artist or band name" required />
                  <SelectField label="What kind of fan are you?" name="fanType" value={formData.fanType} onChange={handleChange} options={fanTypeOptions} placeholder="Choose one" required />
                </div>

                <div className="leadmagnet-two">
                  <Field label="Favorite genre / scene" name="favoriteGenre" value={formData.favoriteGenre} onChange={handleChange} placeholder="Hip-hop, indie, electronic..." required />
                  <SelectField label="How do you find music?" name="discoveryPlatform" value={formData.discoveryPlatform} onChange={handleChange} options={platformOptions} placeholder="Main discovery channel" required />
                </div>

                <div className="leadmagnet-two">
                  <SelectField label="What interests you most?" name="fanGoal" value={formData.fanGoal} onChange={handleChange} options={goalOptions} placeholder="Choose your goal" required />
                  <Field label="City / scene" name="city" value={formData.city} onChange={handleChange} placeholder="Montreal, Toronto, LA..." />
                </div>

                <label className="leadmagnet-consent">
                  <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required />
                  <span>Send me the free fan report and FanFactors Alpha updates. I understand I can unsubscribe anytime.</span>
                </label>

                {status === "success" ? (
                  <div className="leadmagnet-success">Success. Check your inbox for the report and the next FanFactors Alpha update.</div>
                ) : null}

                {status === "error" ? <div className="leadmagnet-error">{errorMessage}</div> : null}

                <button type="submit" disabled={status === "loading"} className="leadmagnet-submit">
                  <span>{status === "loading" ? "Sending..." : "Get the free fan report"}</span>
                </button>

                <p className="leadmagnet-note">
                  No spam. Only FanFactors updates, fan-side music economy notes, and Alpha launch information.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false
}: {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="leadmagnet-field">
      {label}
      {required ? <span> *</span> : null}
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false
}: {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="leadmagnet-field">
      {label}
      {required ? <span> *</span> : null}
      <select name={name} value={value} onChange={onChange} required={required}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
