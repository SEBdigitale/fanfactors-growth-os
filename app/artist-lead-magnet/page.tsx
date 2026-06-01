import type { Metadata } from "next";
import { ArtistLeadMagnetLanding } from "@/components/ArtistLeadMagnetLanding";

export const metadata: Metadata = {
  title: "FanFactors | Free Artist Repeat Business Guide",
  description: "Get the free FanFactors guide for artists who want to turn music into a repeat revenue system with fans."
};

export default function ArtistLeadMagnetPage() {
  return <ArtistLeadMagnetLanding />;
}
