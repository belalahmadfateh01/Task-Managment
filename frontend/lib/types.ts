export type Status = "received" | "feedback" | "approved" | "pending";

export interface Employee {
  id: number;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  joinedAt: string;
  phone?: string;
  address?: string;
}

export interface Report {
  id: string;
  title: string;
  sender: string;
  status: Status;
  /** ISO string */
  createdAt: string;
  archived: boolean;
  /** Reviewer feedback text (set by the "بازخورد" action) */
  note?: string;
}

export type PeriodKey = "daily" | "weekly" | "monthly" | "yearly" | "custom";

/** yyyy-mm-dd strings, as produced by <input type="date"> */
export interface CustomRange {
  from: string;
  to: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}
