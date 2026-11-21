"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import EmployeeDetails from "@/components/EmployeeDetails";
import EmployeeForm from "@/components/EmployeeForm";
import EmployeesTable from "@/components/EmployeesTable";
import Dialog from "@/components/Dialog";
import { api, apiAllPages, apiAssetUrl } from "@/lib/api";
import type { Employee } from "@/lib/types";

type View = "list" | "add" | "details";

export default function EmployeesView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [view, setView] = useState<View>("list");
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiAllPages<Record<string, unknown>>("/employee")
      .then((rows) =>
        setEmployees(
          rows.map((row) => ({
            id: String(row.id),
            name: [row.f_name, row.l_name].filter(Boolean).join(" "),
            firstName: String(row.f_name ?? ""),
            lastName: String(row.l_name ?? ""),
            username:
              typeof row.user_name === "string" ? row.user_name : undefined,
            email: String(row.email ?? ""),
            avatar: apiAssetUrl(
              typeof row.image === "string" ? row.image : null,
            ),
            joinedAt: String(row.created_at ?? "").slice(0, 10),
            phone: typeof row.phone === "string" ? row.phone : undefined,
            address: typeof row.address === "string" ? row.address : undefined,
            lastLoginAt: row.last_login_at
              ? String(row.last_login_at)
              : undefined,
            active: row.is_active !== false,
          })),
        ),
      )
      .catch((cause) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "بارگذاری کارمندان ناموفق بود.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const toggleSelection = (id: string | number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const setEmployeeActive = async (id: string | number, active: boolean) => {
    setError("");
    try {
      await api(`/employee/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: active }),
      });
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === id ? { ...employee, active } : employee,
        ),
      );
      setSelectedIds((current) =>
        active ? current : current.filter((selectedId) => selectedId !== id),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "تغییر وضعیت کارمند ناموفق بود.",
      );
    }
  };

  const removeSelectedEmployees = async () => {
    setError("");
    const ids = [...selectedIds];
    const results = await Promise.allSettled(
      ids.map((id) =>
        api(`/employee/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ is_active: false }),
        }),
      ),
    );
    const deletedIds = ids.filter(
      (_id, index) => results[index].status === "fulfilled",
    );
    setEmployees((current) =>
      current.map((employee) =>
        deletedIds.includes(employee.id)
          ? { ...employee, active: false }
          : employee,
      ),
    );
    setSelectedIds((current) =>
      current.filter((id) => !deletedIds.includes(id)),
    );
    const failedCount = results.length - deletedIds.length;
    if (failedCount)
      setError(
        `${deletedIds.length} کارمند حذف شد؛ حذف ${failedCount} مورد ناموفق بود.`,
      );
    setConfirmBulkDelete(false);
  };

  const addEmployee = async (
    employee: Omit<Employee, "id"> & {
      avatarFile?: File;
      firstName: string;
      lastName: string;
    },
  ) => {
    if (
      employees.some(
        (current) =>
          current.email.toLowerCase() === employee.email.toLowerCase(),
      )
    ) {
      return "این ایمیل قبلاً برای کارمند دیگری ثبت شده است.";
    }
    try {
      const created = await api<Record<string, unknown>>("/employee/register", {
        method: "POST",
        body: JSON.stringify({
          f_name: employee.firstName,
          l_name: employee.lastName,
          user_name: employee.email.split("@")[0],
          email: employee.email,
          password: employee.password,
          role: "teacher",
          phone: employee.phone,
          address: employee.address,
        }),
      });
      let avatar = "/imges/Photo.png";
      if (employee.avatarFile) {
        const form = new FormData();
        form.append("image", employee.avatarFile);
        try {
          const updated = await api<Record<string, unknown>>(
            `/employee/${created.id}/profile/image`,
            { method: "PATCH", body: form },
          );
          avatar = apiAssetUrl(
            typeof updated.image === "string" ? updated.image : avatar,
          );
        } catch (cause) {
          setError(
            cause instanceof Error
              ? `کارمند ثبت شد، اما ذخیره تصویر ناموفق بود: ${cause.message}`
              : "کارمند ثبت شد، اما ذخیره تصویر ناموفق بود.",
          );
        }
      }
      setEmployees((current) => [
        ...current,
        {
          id: String(created.id),
          name: employee.name,
          firstName: employee.firstName,
          lastName: employee.lastName,
          username:
            typeof created.user_name === "string"
              ? created.user_name
              : employee.email.split("@")[0],
          email: employee.email,
          avatar,
          joinedAt: employee.joinedAt,
          phone: employee.phone,
          address:
            typeof created.address === "string"
              ? created.address
              : employee.address,
          active: true,
        },
      ]);
      setView("list");
      return true;
    } catch (cause) {
      return cause instanceof Error
        ? cause.message
        : "افزودن کارمند ناموفق بود.";
    }
  };

  if (view === "add") {
    return <EmployeeForm onBack={() => setView("list")} onAdd={addEmployee} />;
  }

  if (view === "details" && activeEmployee) {
    return (
      <EmployeeDetails
        employee={activeEmployee}
        onBack={() => setView("list")}
        onProfileUpdated={(profile) => {
          const nextEmployee = {
            ...activeEmployee,
            firstName: profile.f_name,
            lastName: profile.l_name,
            username: profile.user_name,
            name: [profile.f_name, profile.l_name].filter(Boolean).join(" "),
            email: profile.email,
            avatar: apiAssetUrl(profile.image),
            phone: profile.phone || undefined,
            address: profile.address || undefined,
          };
          setActiveEmployee(nextEmployee);
          setEmployees((current) =>
            current.map((item) =>
              item.id === activeEmployee.id ? nextEmployee : item,
            ),
          );
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {selectedIds.length ? (
          <button
            type="button"
            onClick={() => setConfirmBulkDelete(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100">
            <Trash2 size={16} /> غیرفعال کردن {selectedIds.length} کارمند
          </button>
        ) : (
          <span></span>
        )}
        <button
          type="button"
          onClick={() => setView("add")}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-deep">
          <Plus size={18} /> افزودن کارمند
        </button>
      </div>
      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">
          در حال بارگذاری کارمندان…
        </p>
      ) : (
        <EmployeesTable
          employees={employees}
          selectedIds={selectedIds}
          onToggle={toggleSelection}
          onToggleStatus={(employee) => {
            if (employee.active) setEmployeeToDelete(employee);
            else void setEmployeeActive(employee.id, true);
          }}
          onOpen={(employee) => {
            setActiveEmployee(employee);
            setView("details");
          }}
        />
      )}
      {employeeToDelete && (
        <Dialog
          title="غیرفعال کردن کارمند"
          description={`کارمند ${employeeToDelete.name} غیرفعال می‌شود، اما اطلاعات، گزارش‌ها و فعالیت‌های او حفظ می‌شوند. می‌توانید بعداً دوباره او را فعال کنید.`}
          confirmLabel="غیرفعال کردن"
          danger
          onClose={() => setEmployeeToDelete(null)}
          onConfirm={() => {
            const id = employeeToDelete.id;
            setEmployeeToDelete(null);
            void setEmployeeActive(id, false);
          }}
        />
      )}
      {confirmBulkDelete && (
        <Dialog
          title={
            selectedIds.length > 1
              ? "غیرفعال کردن چندین کارمند"
              : "غیرفعال کردن کارمند"
          }
          description={
            selectedIds.length > 1
              ? `${selectedIds.length} کارمند غیرفعال می‌شوند، اما اطلاعات و سوابق آنان حفظ می‌شوند.`
              : "کارمند انتخاب‌شده غیرفعال می‌شود، اما اطلاعات و سوابق او حفظ می‌شوند."
          }
          confirmLabel={
            selectedIds.length > 1 ? "غیرفعال کردن همه" : "غیرفعال کردن"
          }
          danger
          onClose={() => setConfirmBulkDelete(false)}
          onConfirm={() => void removeSelectedEmployees()}
        />
      )}
    </div>
  );
}
