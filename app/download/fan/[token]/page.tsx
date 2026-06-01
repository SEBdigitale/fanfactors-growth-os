import { ReportDownloadPage } from "@/components/ReportDownloadPage";

export const dynamic = "force-dynamic";

export default function FanReportDownloadPage({ params }: { params: { token: string } }) {
  return <ReportDownloadPage token={params.token} reportType="fan" />;
}
