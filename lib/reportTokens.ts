import crypto from "crypto";

export type ReportType = "artist" | "fan";

export function createReportToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function reportDownloadPath(reportType: ReportType, token: string) {
  return `/download/${reportType}/${token}`;
}

export function absoluteUrl(request: Request, path: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = configuredUrl || new URL(request.url).origin;
  return new URL(path, origin).toString();
}
