import type { Employee } from "@/lib/types";
import { initialEmployees } from "@/lib/employees";

const EMPLOYEES_KEY = "gozaresh-yar:employees";
const SESSION_KEY = "gozaresh-yar:session";
const EMPLOYEE_REPORTS_KEY = "gozaresh-yar:employee-reports";

export type AppSession =
  | { role: "admin" }
  | { role: "employee"; employeeId: number };

export type EmployeeReportStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "draft";

export type EmployeeReport = {
  id: string;
  employeeId: number;
  title: string;
  content: string;
  createdAt: string;
  status: EmployeeReportStatus;
  reviewNote?: string;
  reviewedAt?: string;
  attachment?: { name: string; size: string; url?: string };
};

export function readEmployees(): Employee[] {
  try {
    const stored = window.localStorage.getItem(EMPLOYEES_KEY);
    return stored ? (JSON.parse(stored) as Employee[]) : initialEmployees;
  } catch {
    return initialEmployees;
  }
}

export function writeEmployees(employees: Employee[]) {
  window.localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

export function readSession(): AppSession | null {
  try {
    const stored = window.localStorage.getItem(SESSION_KEY);
    return stored ? (JSON.parse(stored) as AppSession) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: AppSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function readEmployeeReports(): EmployeeReport[] {
  try {
    const stored = window.localStorage.getItem(EMPLOYEE_REPORTS_KEY);
    return stored ? (JSON.parse(stored) as EmployeeReport[]) : [];
  } catch {
    return [];
  }
}

export function writeEmployeeReports(reports: EmployeeReport[]) {
  window.localStorage.setItem(EMPLOYEE_REPORTS_KEY, JSON.stringify(reports));
}
