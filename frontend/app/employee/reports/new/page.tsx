import type { Metadata } from "next";
import { Suspense } from "react";
import { EmployeeReportComposer } from "@/components/EmployeePortal";

export const metadata: Metadata = { title: "گزارش جدید | گزارش یار" };

export default function NewEmployeeReportPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">
          در حال بارگذاری فرم...
        </div>
      }>
      <EmployeeReportComposer />
    </Suspense>
  );
}
