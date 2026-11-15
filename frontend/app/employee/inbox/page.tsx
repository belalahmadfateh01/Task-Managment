import type { Metadata } from "next";
import { EmployeeReportList } from "@/components/EmployeePortal";

export const metadata: Metadata = { title: "گزارش‌های من | گزارش یار" };

export default function EmployeeInboxPage() {
  return <EmployeeReportList />;
}
