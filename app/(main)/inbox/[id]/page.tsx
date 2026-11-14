import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InboxView from "@/components/InboxView";
import { reports } from "@/lib/inbox";

type InboxReportPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "جزئیات گزارش | گزارش یار",
};

export default async function InboxReportPage({
  params,
}: InboxReportPageProps) {
  const { id } = await params;
  const report = reports.find((item) => item.id === Number(id));

  if (!report) notFound();

  return <InboxView key={report.id} report={report} />;
}
