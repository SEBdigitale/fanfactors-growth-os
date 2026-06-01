import { CampaignLanding } from "@/components/CampaignLanding";
import { getCampaign } from "@/lib/campaigns";

export default function NewMusicEconomyPage() {
  const campaign = getCampaign("new-music-economy");
  if (!campaign) return null;

  return <CampaignLanding campaign={campaign} />;
}
