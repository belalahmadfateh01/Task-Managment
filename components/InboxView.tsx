"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Printer, X } from "lucide-react";
import Items from "@/components/Items";
import InboxDecisionDialog from "@/components/InboxDecisionDialog";
import InboxReportContent from "@/components/InboxReportContent";
import InboxReportSidebar from "@/components/InboxReportSidebar";
import InboxToolbar from "@/components/InboxToolbar";
import { attachmentStyle } from "@/components/inboxAttachmentStyle";
import { reports, type InboxAttachment, type InboxReport } from "@/lib/inbox";

type ReportDecision = "approved" | "rejected";

export default function InboxView({ report }: { report?: InboxReport }) {
  const [activeTab, setActiveTab] = useState("همه");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("همه");
  const [isOpen, setIsOpen] = useState(false);
  const [decision, setDecision] = useState<ReportDecision | null>(null);
  const [decisionAt, setDecisionAt] = useState<Date | null>(null);
  const [pendingDecision, setPendingDecision] = useState<ReportDecision | null>(
    null,
  );
  const [notifySender, setNotifySender] = useState(true);

  useEffect(() => {
    if (!pendingDecision) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPendingDecision(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingDecision]);

  const filteredReports = useMemo(() => {
    const baseList = reports.filter((item) => {
      if (activeTab === "همه") return true;
      return item.category === activeTab;
    });

    switch (selectedFilter) {
      case "دارای ضمیمه":
        return baseList.filter((item) => item.hasAttachment);
      case "بدون ضمیمه":
        return baseList.filter((item) => !item.hasAttachment);
      case "تازه‌ترین":
        return [...baseList].sort((a, b) => b.createdAt - a.createdAt);
      case "قدیمی‌ترین":
        return [...baseList].sort((a, b) => a.createdAt - b.createdAt);
      default:
        return baseList;
    }
  }, [activeTab, selectedFilter]);

  const allItemsSelected =
    reports.length > 0 &&
    reports.every((item) => selectedIds.includes(item.id));

  const toggleAllItems = () => {
    const itemIds = new Set(reports.map((item) => item.id));
    setSelectedIds((current) =>
      allItemsSelected
        ? current.filter((id) => !itemIds.has(id))
        : [...new Set([...current, ...itemIds])],
    );
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  if (report) {
    const attachments: InboxAttachment[] = report.attachments?.length
      ? report.attachments
      : report.hasAttachment
        ? [
            {
              id: `report-${report.id}-attachment`,
              name: report.attachmentName ?? "Students.pdf",
              size: report.attachmentSize ?? "6.8 MB",
            },
          ]
        : [];

    const paragraphs = report.content
      ? report.content.split("\n\n")
      : [
          `گزارش «${report.title}» توسط ${report.sender} ارسال شده است. این متن برای ارائه‌ی جزئیات و بررسی محتوای گزارش در نظر گرفته شده است.`,
          "در این بخش می‌توانید اطلاعات تکمیلی، روند انجام کار و نکات مهم مرتبط با گزارش را مطالعه کنید. محتوای گزارش پس از بررسی قابل تأیید یا بازگشت برای اصلاح است.",
          "لطفاً موارد مطرح‌شده را با دقت بررسی کنید و در صورت نیاز، توضیحات خود را برای فرستنده ثبت کنید.",
        ];

    const isApproved = decision === "approved";
    const isRejected = decision === "rejected";
    const statusLabel = isApproved
      ? "تأیید شده"
      : isRejected
        ? "رد شده"
        : "در انتظار بررسی";
    const decisionDate = decisionAt
      ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(decisionAt)
      : "";

    return (
      <article
        dir="ltr"
        className="grid h-full min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden lap:grid-cols-[minmax(190px,240px)_minmax(0,1fr)]">
        <div
          className="col-span-full flex items-center justify-end pt-2"
          dir="ltr">
          <Link
            href="/inbox"
            className="flex items-center gap-1 text-xs font-medium text-brand-deep hover:text-brand">
            <span>بازگشت به صندوق ورودی</span>
            <ChevronRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div
          className="col-span-full grid min-h-0 grid-cols-1 grid-rows-[auto_auto] gap-3 overflow-y-auto md:grid-cols-[minmax(190px,240px)_minmax(0,1fr)] md:grid-rows-1 md:overflow-hidden"
          dir="ltr">
          <InboxReportSidebar
            report={report}
            attachments={attachments}
            decision={decision}
            isApproved={isApproved}
            isRejected={isRejected}
            statusLabel={statusLabel}
            decisionDate={decisionDate}
          />

          <InboxReportContent
            report={report}
            attachments={attachments}
            paragraphs={paragraphs}
            decision={decision}
            isApproved={isApproved}
            isRejected={isRejected}
            statusLabel={statusLabel}
            decisionDate={decisionDate}
            notifySender={notifySender}
          />
        </div>

        <footer
          className="col-span-full flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-[0_3px_10px_rgba(15,23,42,0.08)] lap:col-start-2"
          dir="rtl">
          {decision ? (
            <p className="text-[10px] text-slate-500">
              تصمیم نهایی ثبت شده است
            </p>
          ) : (
            <p className="text-[10px] text-slate-500">
              پس از مطالعه، تصمیم خود را ثبت کنید
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {decision ? (
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <Printer size={14} aria-hidden="true" />
                چاپ
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setPendingDecision("rejected")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-500 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                  <X size={15} aria-hidden="true" />
                  رد گزارش
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDecision("approved")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand-deep px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                  <Check size={15} aria-hidden="true" />
                  تأیید گزارش
                </button>
              </>
            )}
          </div>
        </footer>

        {pendingDecision && (
          <InboxDecisionDialog
            report={report}
            pendingDecision={pendingDecision}
            notifySender={notifySender}
            onNotifySenderChange={setNotifySender}
            onCancel={() => setPendingDecision(null)}
            onConfirm={() => {
              setDecision(pendingDecision);
              setDecisionAt(new Date());
              setPendingDecision(null);
            }}
          />
        )}
      </article>
    );
  }

  return (
    <div dir="ltr" className="w-full p-4">
      <InboxToolbar
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        allItemsSelected={allItemsSelected}
        onToggleAllItems={toggleAllItems}
        isOpen={isOpen}
        onToggleFilterMenu={() => setIsOpen((previous) => !previous)}
        selectedFilter={selectedFilter}
        onSelectFilter={(filter) => {
          setSelectedFilter(filter);
          setIsOpen(false);
        }}
      />

      <div className="mt-5 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[#E7EDF8]">
        <Items
          items={filteredReports}
          selectedIds={selectedIds}
          onToggleSelected={toggleSelected}
        />
      </div>
    </div>
  );
}
