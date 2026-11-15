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
import {
  readEmployeeReports,
  readEmployees,
  writeEmployeeReports,
  type EmployeeReport,
} from "@/lib/clientStore";

type ReportDecision = "approved" | "rejected";

function inboxId(value: string) {
  const hash = Array.from(value).reduce(
    (current, character) => (current * 31 + character.charCodeAt(0)) | 0,
    0,
  );
  return -Math.max(1, Math.abs(hash));
}

export default function InboxView({
  report,
  reportId,
}: {
  report?: InboxReport;
  reportId?: string;
}) {
  const [activeTab, setActiveTab] = useState("همه");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("همه");
  const [isOpen, setIsOpen] = useState(false);
  const [decision, setDecision] = useState<ReportDecision | null>(null);
  const [decisionAt, setDecisionAt] = useState<Date | null>(null);
  const [employeeReports, setEmployeeReports] = useState<EmployeeReport[]>([]);
  const [employees, setEmployees] = useState<ReturnType<typeof readEmployees>>(
    [],
  );
  const [pendingDecision, setPendingDecision] = useState<ReportDecision | null>(
    null,
  );
  const [notifySender, setNotifySender] = useState(true);

  useEffect(() => {
    setEmployeeReports(readEmployeeReports());
    setEmployees(readEmployees());
  }, []);

  const employeeInboxReports = useMemo<InboxReport[]>(
    () =>
      employeeReports
        .filter((item) => item.status !== "draft")
        .map((item) => {
          const created = new Date(item.createdAt);
          const employee = employees.find(
            (person) => person.id === item.employeeId,
          );
          const attachment: InboxAttachment[] = item.attachment
            ? [{ id: `${item.id}-attachment`, ...item.attachment }]
            : [];
          return {
            id: inboxId(item.id),
            employeeReportId: item.id,
            sender: employee?.name ?? "کارمند",
            title: item.title,
            category: "خوانده نشده" as const,
            hasAttachment: attachment.length > 0,
            createdAt: created.getTime(),
            date: new Intl.DateTimeFormat("fa-IR-u-ca-persian").format(created),
            time: new Intl.DateTimeFormat("fa-IR", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(created),
            content: item.content,
            attachments: attachment,
            attachmentName: item.attachment?.name,
            attachmentSize: item.attachment?.size,
          };
        }),
    [employeeReports, employees],
  );
  const allReports = useMemo(
    () => [...reports, ...employeeInboxReports],
    [employeeInboxReports],
  );
  const activeReport =
    report ??
    employeeInboxReports.find(
      (item) => `employee-${item.employeeReportId}` === reportId,
    );
  const employeeSubmission = activeReport?.employeeReportId
    ? employeeReports.find((item) => item.id === activeReport.employeeReportId)
    : undefined;
  const activeDecision: ReportDecision | null =
    employeeSubmission?.status === "approved" ||
    employeeSubmission?.status === "rejected"
      ? employeeSubmission.status
      : employeeSubmission
        ? null
        : decision;
  const activeDecisionAt = employeeSubmission?.reviewedAt
    ? new Date(employeeSubmission.reviewedAt)
    : decisionAt;

  useEffect(() => {
    if (!pendingDecision) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPendingDecision(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingDecision]);

  const filteredReports = useMemo(() => {
    const baseList = allReports.filter((item) => {
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
  }, [activeTab, allReports, selectedFilter]);

  const allItemsSelected =
    allReports.length > 0 &&
    allReports.every((item) => selectedIds.includes(item.id));

  const toggleAllItems = () => {
    const itemIds = new Set(allReports.map((item) => item.id));
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

  if (reportId && !activeReport) {
    return (
      <p className="p-8 text-center text-sm text-slate-500">
        در حال بارگذاری گزارش...
      </p>
    );
  }

  if (activeReport) {
    const attachments: InboxAttachment[] = activeReport.attachments?.length
      ? activeReport.attachments
      : activeReport.hasAttachment
        ? [
            {
              id: `report-${activeReport.id}-attachment`,
              name: activeReport.attachmentName ?? "Students.pdf",
              size: activeReport.attachmentSize ?? "6.8 MB",
            },
          ]
        : [];

    const paragraphs = activeReport.content
      ? activeReport.content.split("\n\n")
      : [
          `گزارش «${activeReport.title}» توسط ${activeReport.sender} ارسال شده است. این متن برای ارائه‌ی جزئیات و بررسی محتوای گزارش در نظر گرفته شده است.`,
          "در این بخش می‌توانید اطلاعات تکمیلی، روند انجام کار و نکات مهم مرتبط با گزارش را مطالعه کنید. محتوای گزارش پس از بررسی قابل تأیید یا بازگشت برای اصلاح است.",
          "لطفاً موارد مطرح‌شده را با دقت بررسی کنید و در صورت نیاز، توضیحات خود را برای فرستنده ثبت کنید.",
        ];

    const isApproved = activeDecision === "approved";
    const isRejected = activeDecision === "rejected";
    const statusLabel = isApproved
      ? "تأیید شده"
      : isRejected
        ? "رد شده"
        : "در انتظار بررسی";
    const decisionDate = activeDecisionAt
      ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(activeDecisionAt)
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
            report={activeReport}
            attachments={attachments}
            decision={activeDecision}
            isApproved={isApproved}
            isRejected={isRejected}
            statusLabel={statusLabel}
            decisionDate={decisionDate}
          />

          <InboxReportContent
            report={activeReport}
            attachments={attachments}
            paragraphs={paragraphs}
            decision={activeDecision}
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
          {activeDecision ? (
            <p className="text-[10px] text-slate-500">
              تصمیم نهایی ثبت شده است
            </p>
          ) : (
            <p className="text-[10px] text-slate-500">
              پس از مطالعه، تصمیم خود را ثبت کنید
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {activeDecision ? (
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
            report={activeReport}
            pendingDecision={pendingDecision}
            notifySender={notifySender}
            onNotifySenderChange={setNotifySender}
            onCancel={() => setPendingDecision(null)}
            onConfirm={() => {
              if (employeeSubmission) {
                const reviewedAt = new Date().toISOString();
                const updatedReports = employeeReports.map((item) =>
                  item.id === employeeSubmission.id
                    ? { ...item, status: pendingDecision, reviewedAt }
                    : item,
                );
                writeEmployeeReports(updatedReports);
                setEmployeeReports(updatedReports);
              } else {
                setDecision(pendingDecision);
                setDecisionAt(new Date());
              }
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
