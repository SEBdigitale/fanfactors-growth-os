import { ReportDownloadPage } from "@/components/ReportDownloadPage";

export const dynamic = "force-dynamic";

export default function ArtistReportDownloadPage({ params }: { params: { token: string } }) {
  return <ReportDownloadPage token={params.token} reportType="artist" />;
}
