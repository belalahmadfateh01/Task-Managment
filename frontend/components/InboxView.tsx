"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Printer, X } from "lucide-react";
import Items from "@/components/Items";
import InboxDecisionDialog from "@/components/InboxDecisionDialog";
import InboxReportContent from "@/components/InboxReportContent";
import InboxReportSidebar from "@/components/InboxReportSidebar";
import InboxToolbar from "@/components/InboxToolbar";
import { attachmentStyle } from "@/components/inboxAttachmentStyle";
import { type InboxAttachment, type InboxReport } from "@/lib/inbox";
import { api, apiAllPages, apiAssetUrl } from "@/lib/api";

type ReportDecision = "approved" | "rejected";

function mapReport(row: Record<string, unknown>): InboxReport {
  const createdAt = new Date(String(row.report_date ?? ""));
  const status = row.status === "accept" || row.status === "comment" ? row.status : "pending";
  const name = [row.f_name, row.l_name].filter(Boolean).join(" ");
  const fileName = typeof row.file_name === "string" ? row.file_name : undefined;
  const filePath = typeof row.file_path === "string" ? row.file_path : undefined;
  const fileSize = Number(row.file_size ?? 0);
  const id = String(row.id);
  return {
    id,
    backendId: id,
    status,
    archived: Boolean(row.archived_at),
    reviewedAt: status === "pending" ? undefined : String(row.updated_at ?? ""),
    sender: name || "کارمند",
    senderAvatar: apiAssetUrl(typeof row.image === "string" ? row.image : null),
    title: String(row.title ?? ""),
    category: row.read_at ? "خوانده شده" : "خوانده نشده",
    hasAttachment: Boolean(fileName),
    createdAt: createdAt.getTime(),
    date: new Intl.DateTimeFormat("fa-IR-u-ca-persian").format(createdAt),
    time: new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(createdAt),
    content: String(row.text ?? ""),
    attachmentName: fileName,
    attachments: fileName ? [{
      id: `${id}-attachment`,
      name: fileName,
      size: fileSize ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB` : "",
      downloadEndpoint: filePath ? `/report/${id}/file` : undefined,
    }] : [],
    commentText: typeof row.comment_text === "string" ? row.comment_text : undefined,
  };
}

export default function InboxView({
  report,
  reportId,
}: {
  report?: InboxReport;
  reportId?: string;
}) {
  const [activeTab, setActiveTab] = useState("همه");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("همه");
  const [isOpen, setIsOpen] = useState(false);
  const [decision, setDecision] = useState<ReportDecision | null>(null);
  const [decisionAt, setDecisionAt] = useState<Date | null>(null);
  const [pendingDecision, setPendingDecision] = useState<ReportDecision | null>(
    null,
  );
  const [feedbackText, setFeedbackText] = useState("");
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [backendReports, setBackendReports] = useState<InboxReport[]>([]);
  const markedReports = useRef(new Set<string>());
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    apiAllPages<Record<string, unknown>>("/report")
      .then((rows) => setBackendReports(rows.map(mapReport)))
      .catch((cause) => setLoadError(cause instanceof Error ? cause.message : "بارگذاری صندوق ورودی ناموفق بود."));
  }, []);

  useEffect(() => {
    if (!reportId) return;
    void api<Record<string, unknown>[]>(`/report/${reportId}`)
      .then((rows) => {
        const item = mapReport(rows[0]);
        setBackendReports((current) => current.some((row) => row.backendId === reportId)
          ? current
          : [item, ...current]);
      })
      .catch((cause) => setLoadError(cause instanceof Error ? cause.message : "بارگذاری گزارش ناموفق بود."));
  }, [reportId]);

  const activeReport =
    report ??
    backendReports.find((item) => item.backendId === reportId);

  useEffect(() => {
    if (!reportId || !activeReport?.backendId || activeReport.category === "خوانده شده" || markedReports.current.has(reportId)) return;
    markedReports.current.add(reportId);
    void api(`/report/${reportId}/read`, { method: "PATCH" })
      .then(() => setBackendReports((current) => current.map((item) => item.backendId === reportId
        ? { ...item, category: "خوانده شده" }
        : item)))
      .catch((cause) => setActionError(cause instanceof Error ? cause.message : "ثبت خوانده‌شدن گزارش ناموفق بود."));
  }, [reportId, activeReport?.backendId, activeReport?.category]);
  const activeDecision: ReportDecision | null =
    activeReport?.status === "accept"
      ? "approved"
      : activeReport?.status === "comment"
        ? "rejected"
        : decision;
  const activeDecisionAt = activeReport?.reviewedAt
    ? new Date(activeReport.reviewedAt)
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
    const baseList = backendReports.filter((item) => !item.archived);
    const tabList = baseList.filter((item) => {
      if (activeTab === "همه") return true;
      return item.category === activeTab;
    });

    switch (selectedFilter) {
      case "دارای ضمیمه":
        return tabList.filter((item) => item.hasAttachment);
      case "بدون ضمیمه":
        return tabList.filter((item) => !item.hasAttachment);
      case "تازه‌ترین":
        return [...tabList].sort((a, b) => b.createdAt - a.createdAt);
      case "قدیمی‌ترین":
        return [...tabList].sort((a, b) => a.createdAt - b.createdAt);
      default:
        return tabList;
    }
  }, [activeTab, backendReports, selectedFilter]);

  const visibleInboxReports = backendReports.filter((item) => !item.archived);
  const allItemsSelected =
    visibleInboxReports.length > 0 &&
    visibleInboxReports.every((item) => selectedIds.includes(item.id));

  const toggleAllItems = () => {
    const itemIds = new Set(visibleInboxReports.map((item) => item.id));
    setSelectedIds((current) =>
      allItemsSelected
        ? current.filter((id) => !itemIds.has(id))
        : [...new Set([...current, ...itemIds])],
    );
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const selectedReports = visibleInboxReports.filter((item) => selectedIds.includes(item.id));
  const bulkArchive = async () => {
    const targets = selectedReports.filter((item) => item.backendId);
    if (!targets.length) return;
    setIsBulkUpdating(true);
    setActionError("");
    const results = await Promise.allSettled(targets.map((item) => api(`/report/${item.backendId}/archive`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    })));
    const archivedIds = new Set(targets.filter((_item, index) => results[index].status === "fulfilled").map((item) => item.id));
    setBackendReports((current) => current.map((item) => archivedIds.has(item.id) ? { ...item, archived: true } : item));
    setSelectedIds((current) => current.filter((id) => !archivedIds.has(id)));
    const failedCount = results.length - archivedIds.size;
    if (failedCount) setActionError(`بایگانی ${failedCount} گزارش ناموفق بود.`);
    setIsBulkUpdating(false);
  };

  const bulkMarkRead = async () => {
    const targets = selectedReports.filter((item) => item.category === "خوانده نشده" && item.backendId);
    if (!targets.length) return;
    setIsBulkUpdating(true);
    setActionError("");
    const results = await Promise.allSettled(targets.map((item) => api(`/report/${item.backendId}/read`, { method: "PATCH" })));
    const readIds = new Set(targets.filter((_item, index) => results[index].status === "fulfilled").map((item) => item.id));
    setBackendReports((current) => current.map((item) => readIds.has(item.id) ? { ...item, category: "خوانده شده" } : item));
    const failedCount = results.length - readIds.size;
    if (failedCount) setActionError(`ثبت خوانده‌شدن ${failedCount} گزارش ناموفق بود.`);
    setIsBulkUpdating(false);
  };

  if (reportId && !activeReport) {
    return (
      <p className="p-8 text-center text-sm text-slate-500">
        {loadError || "در حال بارگذاری گزارش..."}
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
        {actionError && (
          <p role="alert" className="col-span-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </p>
        )}

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
                  onClick={() => {
                    setActionError("");
                    setFeedbackText("");
                    setPendingDecision("rejected");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-500 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                  <X size={15} aria-hidden="true" />
                  رد گزارش
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionError("");
                    setPendingDecision("approved");
                  }}
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
            feedbackText={feedbackText}
            onFeedbackTextChange={setFeedbackText}
            isSaving={isSavingDecision}
            error={actionError}
            onCancel={() => {
              if (isSavingDecision) return;
              setPendingDecision(null);
              setActionError("");
            }}
            onConfirm={async () => {
              if (!activeReport.backendId) return;
              if (pendingDecision === "rejected" && !feedbackText.trim()) {
                setActionError("برای بازگرداندن گزارش، بازخورد را بنویسید.");
                return;
              }
              setActionError("");
              const status = pendingDecision === "approved" ? "accept" : "comment";
              setIsSavingDecision(true);
              try {
                if (pendingDecision === "approved") {
                  await api(`/report/${activeReport.backendId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ status }),
                  });
                } else {
                  await api(`/comment/${activeReport.backendId}`, {
                    method: "POST",
                    body: JSON.stringify({ text: feedbackText.trim() }),
                  });
                }
                setBackendReports((current) => current.map((item) =>
                  item.backendId === activeReport.backendId
                    ? {
                        ...item,
                        status,
                        category: "خوانده شده",
                        reviewedAt: new Date().toISOString(),
                        commentText: pendingDecision === "rejected" ? feedbackText.trim() : item.commentText,
                      }
                    : item,
                ));
                setDecision(pendingDecision);
                setDecisionAt(new Date());
                setPendingDecision(null);
              } catch (cause) {
                setActionError(cause instanceof Error ? cause.message : "ثبت تصمیم ناموفق بود.");
              } finally {
                setIsSavingDecision(false);
              }
            }}
          />
        )}
      </article>
    );
  }

  return (
    <div dir="ltr" className="w-full p-4">
      {loadError && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </p>
      )}
      {actionError && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </p>
      )}
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

      {selectedIds.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
          <span className="ml-auto text-xs font-medium text-blue-900">{selectedIds.length.toLocaleString("fa-IR")} گزارش انتخاب شد</span>
          <button type="button" disabled={isBulkUpdating || !selectedReports.some((item) => item.category === "خوانده نشده")} onClick={() => void bulkMarkRead()} className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 disabled:opacity-50">علامت‌گذاری به‌عنوان خوانده‌شده</button>
          <button type="button" disabled={isBulkUpdating} onClick={() => void bulkArchive()} className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">بایگانی انتخاب‌شده‌ها</button>
          <button type="button" disabled={isBulkUpdating} onClick={() => setSelectedIds([])} className="rounded-md px-3 py-1.5 text-xs text-slate-600 disabled:opacity-50">لغو انتخاب</button>
        </div>
      )}

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
