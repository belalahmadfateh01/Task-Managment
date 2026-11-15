"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import EmployeeDetails from "@/components/EmployeeDetails";
import EmployeeForm from "@/components/EmployeeForm";
import EmployeesTable from "@/components/EmployeesTable";
import { initialEmployees } from "@/lib/employees";
import type { Employee } from "@/lib/types";

type View = "list" | "add" | "details";

export default function EmployeesView() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [view, setView] = useState<View>("list");
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    try {
      const savedEmployees = window.localStorage.getItem(
        "gozaresh-yar:employees",
      );
      if (savedEmployees)
        setEmployees(JSON.parse(savedEmployees) as Employee[]);
    } catch {
      window.localStorage.removeItem("gozaresh-yar:employees");
    }
    setEmployeesLoaded(true);
  }, []);

  useEffect(() => {
    if (employeesLoaded) {
      window.localStorage.setItem(
        "gozaresh-yar:employees",
        JSON.stringify(employees),
      );
    }
  }, [employees, employeesLoaded]);

  const toggleSelection = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const removeEmployee = (id: number) => {
    setEmployees((current) => current.filter((employee) => employee.id !== id));
    setSelectedIds((current) =>
      current.filter((selectedId) => selectedId !== id),
    );
  };

  const addEmployee = (employee: Omit<Employee, "id">) => {
    if (
      employees.some(
        (current) =>
          current.email.toLowerCase() === employee.email.toLowerCase(),
      )
    ) {
      return false;
    }
    const newEmployee = {
      ...employee,
      id: Math.max(0, ...employees.map((item) => item.id)) + 1,
    };
    setEmployees((current) => [...current, newEmployee]);
    setView("list");
    return true;
  };

  if (view === "add") {
    return <EmployeeForm onBack={() => setView("list")} onAdd={addEmployee} />;
  }

  if (view === "details" && activeEmployee) {
    return (
      <EmployeeDetails
        employee={activeEmployee}
        onBack={() => setView("list")}
        onAvatarChange={(avatar) => {
          setActiveEmployee((current) =>
            current ? { ...current, avatar } : current,
          );
          setEmployees((current) =>
            current.map((item) =>
              item.id === activeEmployee.id ? { ...item, avatar } : item,
            ),
          );
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {selectedIds.length ? (
          <button
            type="button"
            onClick={() => {
              setEmployees((current) =>
                current.filter(
                  (employee) => !selectedIds.includes(employee.id),
                ),
              );
              setSelectedIds([]);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100">
            <Trash2 size={16} /> حذف {selectedIds.length} کارمند
          </button>
        ) : (
          <span className="text-xs text-slate-500">
            برای حذف گروهی، کارمندان را انتخاب کنید.
          </span>
        )}
        <button
          type="button"
          onClick={() => setView("add")}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-deep">
          <Plus size={18} /> افزودن کارمند
        </button>
      </div>
      <EmployeesTable
        employees={employees}
        selectedIds={selectedIds}
        onToggle={toggleSelection}
        onDelete={removeEmployee}
        onOpen={(employee) => {
          setActiveEmployee(employee);
          setView("details");
        }}
      />
    </div>
  );
}
