import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = { title: "نمای کلی | گزارش یار" };

export default function DashboardPage() {
  return <Dashboard />;
}
