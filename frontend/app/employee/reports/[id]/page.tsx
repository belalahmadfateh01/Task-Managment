import type { Metadata } from "next";
import { EmployeeReportPage } from "@/components/EmployeePortal";

type EmployeeReportRouteProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = { title: "جزئیات گزارش | گزارش یار" };

export default async function EmployeeReportRoute({
  params,
}: EmployeeReportRouteProps) {
  const { id } = await params;
  return <EmployeeReportPage reportId={id} />;
}
