import type { Metadata } from "next";
import InboxView from "@/components/InboxView";

export const metadata: Metadata = { title: "صندوق ورودی | گزارش یار" };

export default function InboxPage() {
  return <InboxView />;
}
