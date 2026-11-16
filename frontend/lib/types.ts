export type Status = "feedback" | "approved" | "pending";

export interface Employee {
  id: string | number;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  password?: string;
  avatar: string;
  joinedAt: string;
  lastLoginAt?: string;
  phone?: string;
  address?: string;
}

export interface Report {
  id: string;
  title: string;
  sender: string;
  senderAvatar?: string;
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
