const SESSION_KEY = "gozaresh-yar:session";
const EMPLOYEE_REPORTS_KEY = "gozaresh-yar:employee-reports";

export type AppSession = {
  role: "admin" | "teacher";
  employeeId: string;
};

export type EmployeeReportStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "draft";

export type EmployeeReport = {
  id: string;
  employeeId: string;
  title: string;
  content: string;
  createdAt: string;
  status: EmployeeReportStatus;
  serverBacked?: boolean;
  reviewNote?: string;
  reviewedAt?: string;
  attachment?: { name: string; size: string; url?: string; downloadEndpoint?: string };
};

export function readSession(): AppSession | null {
  try {
    const stored = window.localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored) as Partial<AppSession>;
    if (!session || typeof session !== "object") {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    if ("token" in session) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    if (
      (session.role !== "admin" && session.role !== "teacher") ||
      typeof session.employeeId !== "string"
    ) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session as AppSession;
  } catch {
    return null;
  }
}

export function writeSession(session: AppSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ role: session.role, employeeId: session.employeeId }));
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
