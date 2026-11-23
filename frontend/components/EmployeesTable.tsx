"use client";

import Image from "next/image";
import { Power } from "lucide-react";
import type { Employee } from "@/lib/types";

interface EmployeesTableProps {
  employees: Employee[];
  selectedIds: Array<string | number>;
  onToggle: (id: string | number) => void;
  onToggleStatus: (employee: Employee) => void;
  onOpen: (employee: Employee) => void;
}

function joinedDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB");
}

export default function EmployeesTable({
  employees,
  selectedIds,
  onToggle,
  onToggleStatus,
  onOpen,
}: EmployeesTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(110px,0.8fr)_52px] items-center border-b border-line px-4 py-3 text-xs font-semibold text-slate-600 sm:grid-cols-[minmax(0,1.4fr)_minmax(150px,1fr)_70px] sm:px-7">
        <span className="mr-16">اعضای تیم</span>
        <span className="text-center">تاریخ پیوستن</span>
        <span className="text-center">وضعیت</span>
      </div>

      {employees.length === 0 ? (
        <p className="px-4 py-20 text-center text-sm text-slate-500">
          کارمندی برای نمایش وجود ندارد.
        </p>
      ) : (
        employees.map((employee) => (
          <div
            key={employee.id}
            className="grid min-h-[82px] grid-cols-[minmax(0,1.3fr)_minmax(110px,0.8fr)_52px] items-center border-b border-line/70 px-4 last:border-b-0 hover:bg-slate-50/70 sm:min-h-[86px] sm:grid-cols-[minmax(0,1.4fr)_minmax(150px,1fr)_70px] sm:px-7">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
              <button
                type="button"
                onClick={() => onOpen(employee)}
                className="flex min-w-0 items-center gap-2.5 text-right sm:gap-4">
                <Image
                  src={employee.avatar}
                  alt=""
                  width={44}
                  height={44}
                  unoptimized
                  className="size-9 shrink-0 rounded-full object-cover sm:size-11"
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-slate-900 sm:text-sm">
                    {employee.name}
                  </span>
                  <span
                    className="mt-1 block truncate text-[10px] text-slate-500 sm:text-xs"
                    dir="ltr">
                    {employee.email}
                  </span>
                </span>
              </button>
            </div>
            <span
              className="text-center text-[11px] text-slate-600 sm:text-sm"
              dir="ltr">
              {joinedDate(employee.joinedAt)}
            </span>
            <span className="flex justify-center">
              <button
                type="button"
                role="switch"
                aria-checked={employee.active}
                onClick={() => onToggleStatus(employee)}
                aria-label={`${employee.active ? "غیرفعال کردن" : "فعال کردن"} ${employee.name}`}
                title={
                  employee.active ? "غیرفعال کردن کارمند" : "فعال کردن کارمند"
                }
                className={`grid size-8 place-items-center rounded-md border transition ${
                  employee.active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    : "border-red-300 bg-red-100 text-red-500 hover:bg-red-200"
                }`}>
                <Power size={15} strokeWidth={1.8} />
              </button>
            </span>
          </div>
        ))
      )}
    </section>
  );
}
