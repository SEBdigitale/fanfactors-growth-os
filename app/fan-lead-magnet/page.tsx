import type { Metadata } from "next";
import { FanLeadMagnetLanding } from "@/components/FanLeadMagnetLanding";

export const metadata: Metadata = {
  title: "FanFactors | Free Fan-Side Music Economy Report",
  description:
    "Get the free FanFactors report for fans who want to understand discovery, artist access, drops, and the new music economy."
};

export default function FanLeadMagnetPage() {
  return <FanLeadMagnetLanding />;
}
