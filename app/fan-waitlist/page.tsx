import { CampaignLanding } from "@/components/CampaignLanding";
import { getCampaign } from "@/lib/campaigns";

export default function FanWaitlistPage() {
  const campaign = getCampaign("fan-waitlist");
  if (!campaign) return null;

  return <CampaignLanding campaign={campaign} />;
}
