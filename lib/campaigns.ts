import type { Campaign, CampaignSlug } from "@/lib/types";

export const campaigns: Campaign[] = [
  {
    slug: "artist-lead-magnet",
    path: "/artist-lead-magnet",
    audience: "Artists",
    title: "Build direct demand before your next release.",
    description:
      "Get the free guide on turning songs, drops, and fan attention into a repeat revenue engine.",
    formTitle: "Get the artist growth brief",
    formDescription: "Tell us where to send it and what you are building next.",
    thankYouPath: "/thank-you/artist",
    nextUrl: "https://fanfaktors.com/signup?persona=artist",
    heroImage:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1800&q=80",
    signals: [
      { title: "Sell access", body: "Learn how a fan can buy more than a stream." },
      { title: "Set your price", body: "See why the creator should control the offer." },
      { title: "Get paid again", body: "Build around repeat transactions, not one-time attention." }
    ]
  },
  {
    slug: "fan-waitlist",
    path: "/fan-waitlist",
    audience: "Fans",
    title: "Get closer to the artists before everyone else does.",
    description:
      "Join the early list for drops, first looks, and fan access built for people who find the music first.",
    formTitle: "Get fan access",
    formDescription: "Tell us what you listen to. We will send the early access link when your lane opens.",
    thankYouPath: "/thank-you/fan",
    nextUrl: "https://fanfaktors.com/alpha",
    heroImage: "/images/campaign-fan-waitlist-2pac.png",
    signals: [
      { title: "Early drops", body: "Get first looks before the public hears about them." },
      { title: "Better access", body: "Hear about artist moments, releases, and fan rewards sooner." },
      { title: "Your scene", body: "Tell us what you like so the right music finds you." }
    ]
  },
  {
    slug: "fan-lead-magnet",
    path: "/fan-lead-magnet",
    audience: "Fans",
    title: "Own the moment before the crowd catches on.",
    description:
      "Get the fan report on early access, artist drops, resale rights, and why the next music wave rewards the people who show up first.",
    formTitle: "Send me the fan report",
    formDescription: "Tell us where to send it and what kind of music access you want.",
    thankYouPath: "/thank-you/fan",
    nextUrl: "https://fanfaktors.com/alpha",
    heroImage:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1800&q=80",
    signals: [
      { title: "Find it early", body: "Get closer to artists before the whole market notices." },
      { title: "Buy real access", body: "Learn what fans may be able to own, resell, and use." },
      { title: "Move first", body: "Be ready when the first FanFactors drops open." }
    ]
  },
  {
    slug: "alpha",
    path: "/alpha",
    audience: "Early access",
    title: "Get inside FanFactors before the public launch.",
    description:
      "Artists, fans, managers, and music builders are getting early access in waves. Put your name in now and get the right invite when your lane opens.",
    formTitle: "Request your invite",
    formDescription: "Tell us who you are and what you want to use FanFactors for.",
    thankYouPath: "/thank-you/artist",
    nextUrl: "https://fanfaktors.com/alpha",
    heroImage: "/images/campaign-alpha-taking-music-back.png",
    signals: [
      { title: "First look", body: "See the platform before the crowd gets in." },
      { title: "Right invite", body: "Artists, fans, and partners get different paths." },
      { title: "Launch edge", body: "Be ready when the first drops and campaigns open." }
    ]
  },
  {
    slug: "new-music-economy",
    path: "/new-music-economy",
    audience: "Free brief",
    title: "The music business is changing. Do not be the last to see it.",
    description:
      "Get the short brief on how artists can sell access, fans can get closer, and every release can become more than a one-time transaction.",
    formTitle: "Send me the brief",
    formDescription: "Get the short version and see where you fit.",
    thankYouPath: "/thank-you/artist",
    nextUrl: "https://fanfaktors.com/signup",
    heroImage: "/images/campaign-new-music-economy-eminem-dre.png",
    signals: [
      { title: "For artists", body: "Turn attention into direct demand." },
      { title: "For fans", body: "Get closer than streaming ever allowed." },
      { title: "For builders", body: "See why access, rights, and fan identity matter now." }
    ]
  }
];

export function getCampaign(slug: CampaignSlug) {
  return campaigns.find((campaign) => campaign.slug === slug);
}
