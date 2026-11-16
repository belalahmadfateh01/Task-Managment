import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "صفحه اصلی | گزارش یار" };

export default function EmployeeInboxPage() {
  redirect("/employee/dashboard");
}
