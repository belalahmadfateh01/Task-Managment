import type { Metadata } from "next";
import { EmployeeTasksPage } from "@/components/EmployeePortal";

export const metadata: Metadata = { title: "فعالیت‌ها | گزارش یار" };

export default function EmployeeTasksRoute() {
  return <EmployeeTasksPage />;
}
