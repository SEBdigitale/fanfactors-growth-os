import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FanFactors Growth OS",
  description: "Campaign landing pages and lead intelligence for FanFactors."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
