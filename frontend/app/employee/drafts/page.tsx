import type { Metadata } from "next";
import { EmployeeReportList } from "@/components/EmployeePortal";

export const metadata: Metadata = { title: "پیش‌نویس‌ها | گزارش یار" };

export default function EmployeeDraftsPage() {
  return <EmployeeReportList draftsOnly />;
}
