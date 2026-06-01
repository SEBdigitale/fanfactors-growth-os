"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const formStart = {
  firstName: "",
  email: "",
  artistName: "",
  role: "",
  genre: "",
  audienceSize: "",
  mainPlatform: "",
  goal: "",
  musicLink: "",
  consent: false,
  utmSource: "direct",
  utmMedium: "none",
  utmCampaign: "none",
  utmContent: "none",
  utmTerm: "none"
};

const roleOptions = [
  "Artist / Singer",
  "Band",
  "Producer",
  "Manager",
  "Label / Studio",
  "Fan / Street Team",
  "Other"
];

const audienceOptions = [
  "Just starting",
  "Under 1,000 fans",
  "1,000 - 10,000 fans",
  "10,000 - 100,000 fans",
  "100,000+ fans"
];

const platformOptions = ["Spotify", "Apple Music", "YouTube", "TikTok", "Instagram", "SoundCloud", "Bandcamp", "Other"];

const goalOptions = [
  "Get more fans",
  "Sell more music",
  "Build a repeat revenue system",
  "Launch a new album / single",
  "Find fan ambassadors",
  "Learn about FanFactors Alpha"
];

type FormData = typeof formStart;
type Status = "idle" | "loading" | "success" | "error";

export function ArtistLeadMagnetLanding() {
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
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

    if (!emailLooksValid) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!formData.consent) {
      setStatus("error");
      setErrorMessage("Please confirm that FanFactors can send you the guide and Alpha updates.");
      return;
    }

    try {
      const response = await fetch("/api/lead-magnet-signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: cleanEmail,
          leadMagnet: "Transform Your Music Into an Infinite Repeat Business",
          page: "artist-lead-magnet"
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

      window.location.href = result.redirectTo || "/thank-you/artist";
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="leadmagnet-page">
      <div className="leadmagnet-glow" />
      <div className="leadmagnet-grid-bg" />

      <section className="leadmagnet-shell">
        <div className="leadmagnet-card">
          <div className="leadmagnet-cover">
            <Image
              src="/images/fanfactors-lead-magnet-cover.png"
              alt="FanFactors lead magnet book cover for music repeat business"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 54vw"
              className="leadmagnet-cover-image"
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
                <span>Artist Growth File</span>
              </div>
            </div>

            <div className="leadmagnet-cover-copy">
              <p>Free lead magnet</p>
              <span>
                Learn how FanFactors turns fans into a growth force for artists, releases, music sales, resale rights,
                and long-term engagement.
              </span>
            </div>
          </div>

          <div className="leadmagnet-form-panel">
            <Image src="/images/fanfactors-logo.jpg" alt="" width={220} height={190} className="leadmagnet-watermark" />

            <div className="leadmagnet-form-wrap">
              <div className="leadmagnet-heading">
                <div className="leadmagnet-pill">For artists, bands & music builders</div>
                <h1>Turn your music into a repeat revenue engine.</h1>
                <p>
                  Get the free FanFactors guide and learn the model behind fan-powered music sales, resale rights, and
                  the coming Alpha launch.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="leadmagnet-form">
                <div className="leadmagnet-two">
                  <Field label="First name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Sebastien" required />
                  <Field label="Email address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" required />
                </div>

                <div className="leadmagnet-two">
                  <Field label="Artist / project name" name="artistName" value={formData.artistName} onChange={handleChange} placeholder="Your artist name" required />
                  <SelectField label="Your role" name="role" value={formData.role} onChange={handleChange} options={roleOptions} placeholder="Choose your role" required />
                </div>

                <div className="leadmagnet-two">
                  <Field label="Main genre" name="genre" value={formData.genre} onChange={handleChange} placeholder="Hip-hop, rock, pop..." required />
                  <SelectField label="Current audience size" name="audienceSize" value={formData.audienceSize} onChange={handleChange} options={audienceOptions} placeholder="Choose one" required />
                </div>

                <div className="leadmagnet-two">
                  <SelectField label="Main platform" name="mainPlatform" value={formData.mainPlatform} onChange={handleChange} options={platformOptions} placeholder="Where are you most active?" required />
                  <SelectField label="Biggest goal" name="goal" value={formData.goal} onChange={handleChange} options={goalOptions} placeholder="Choose your goal" required />
                </div>

                <Field label="Music or social link" name="musicLink" type="url" value={formData.musicLink} onChange={handleChange} placeholder="Spotify, YouTube, Instagram, website..." />

                <label className="leadmagnet-consent">
                  <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required />
                  <span>Send me the free guide and FanFactors Alpha updates. I understand I can unsubscribe anytime.</span>
                </label>

                {status === "success" ? (
                  <div className="leadmagnet-success">Success. Check your inbox for the guide and the next FanFactors Alpha update.</div>
                ) : null}

                {status === "error" ? <div className="leadmagnet-error">{errorMessage}</div> : null}

                <button type="submit" disabled={status === "loading"} className="leadmagnet-submit">
                  <span>{status === "loading" ? "Sending..." : "Get the free guide"}</span>
                </button>

                <p className="leadmagnet-note">
                  No spam. No fake hype. Only FanFactors updates, artist growth notes, and Alpha launch information.
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
