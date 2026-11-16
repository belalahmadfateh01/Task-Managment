import type { Metadata } from "next";
import { EmployeeDashboard } from "@/components/EmployeePortal";

export const metadata: Metadata = { title: "صندوق ارسالی | گزارش یار" };

export default function EmployeeDashboardPage() {
  return <EmployeeDashboard />;
}
