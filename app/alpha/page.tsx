import { CampaignLanding } from "@/components/CampaignLanding";
import { getCampaign } from "@/lib/campaigns";

export default function AlphaPage() {
  const campaign = getCampaign("alpha");
  if (!campaign) return null;

  return <CampaignLanding campaign={campaign} />;
}
