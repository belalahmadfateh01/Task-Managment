import type { Metadata } from "next";
import InboxView from "@/components/InboxView";

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
  return <InboxView reportId={id} />;
}
