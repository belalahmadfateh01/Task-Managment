"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Check, Download } from "lucide-react";
import Dialog from "@/components/Dialog";
import Items from "@/components/Items";
import { reports, type InboxAttachment, type InboxReport } from "@/lib/inbox";

const tabs = ["همه", "خوانده شده", "خوانده نشده"];
const filterOptions = ["دارای ضمیمه", "بدون ضمیمه", "تازه‌ترین", "قدیمی‌ترین"];

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "avif",
]);

function attachmentStyle(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  const isImage = IMAGE_EXTENSIONS.has(extension);
  const color = isImage
    ? "bg-pink-100 text-pink-700"
    : extension === "pdf"
      ? "bg-red-100 text-red-700"
      : ["doc", "docx"].includes(extension)
        ? "bg-blue-100 text-blue-700"
        : ["xls", "xlsx"].includes(extension)
          ? "bg-emerald-100 text-emerald-700"
          : ["ppt", "pptx"].includes(extension)
            ? "bg-orange-100 text-orange-700"
            : extension === "txt"
              ? "bg-slate-100 text-slate-700"
              : "bg-violet-100 text-violet-700";

  return { extension, isImage, color };
}

export default function InboxView({ report }: { report?: InboxReport }) {
  const [activeTab, setActiveTab] = useState("همه");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("همه");
  const [isOpen, setIsOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);

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

    return (
      <article className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between gap-4 px-6 pt-6 sm:px-10">
            <Link
              href="/inbox"
              className="flex items-center gap-2 text-sm font-medium text-brand-deep hover:text-brand">
              <ChevronRight size={18} aria-hidden="true" />
              <span>بازگشت</span>
            </Link>
            <time dir="ltr" className="text-sm text-slate-700">
              {report.date} - {report.time}
            </time>
          </div>

          <div className="flex items-center justify-start gap-4 px-6 pt-7 sm:px-10">
            <div
              aria-hidden="true"
              className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-lg font-bold text-white">
              {report.sender.slice(0, 1)}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">فرستنده:</p>
              <p className="mt-1 font-semibold text-slate-900">
                {report.sender}
              </p>
            </div>
          </div>

          <div className="px-6 pb-8 pt-7 sm:px-10">
            <h1 className="mb-6 text-right text-2xl font-bold text-slate-950">
              {report.title}
            </h1>
            <div className="space-y-5 text-right leading-8 text-slate-800">
              {paragraphs.map((paragraph, index) => (
                <p key={`${report.id}-paragraph-${index}`}>{paragraph}</p>
              ))}
            </div>

            <section className="mt-10" aria-label="پیوست‌های گزارش">
              {attachments.length > 0 && (
                <>
                  <h2 className="mb-4 font-semibold text-slate-800">
                    پیوست‌های دریافتی
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {attachments.map((attachment) => {
                      const { extension, isImage, color } = attachmentStyle(
                        attachment.name,
                      );

                      return (
                        <div
                          key={attachment.id}
                          className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {isImage && attachment.url ? (
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="size-11 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <span
                                className={`grid size-11 shrink-0 place-items-center rounded-xl text-[10px] font-bold uppercase ${color}`}>
                                {extension || "FILE"}
                              </span>
                            )}
                            <span className="min-w-0">
                              <span
                                className="block truncate text-sm font-semibold text-slate-800"
                                title={attachment.name}>
                                {attachment.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                {attachment.size}
                              </span>
                            </span>
                          </div>
                          {attachment.url ? (
                            <a
                              href={attachment.url}
                              download={attachment.name}
                              aria-label={`دانلود ${attachment.name}`}
                              className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-700 hover:bg-slate-100">
                              <Download size={20} aria-hidden="true" />
                            </a>
                          ) : (
                            <span
                              className="grid size-9 shrink-0 place-items-center text-slate-300"
                              aria-label="دانلود در دسترس نیست">
                              <Download size={20} aria-hidden="true" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          </div>
        </div>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.08)] sm:px-10">
          <div dir="ltr" className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsApproved(true)}
              disabled={isApproved}
              className="min-w-20 rounded-md bg-brand-deep px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-default disabled:bg-emerald-600">
              {isApproved ? "تأیید شد" : "تأیید"}
            </button>
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">
              بازخورد
            </button>
            {feedbackSaved && (
              <span
                className="self-center text-sm text-emerald-700"
                role="status">
                بازخورد ثبت شد
              </span>
            )}
          </div>
        </footer>

        {isFeedbackOpen && (
          <Dialog
            title="ثبت بازخورد"
            description={`بازخورد خود را برای «${report.title}» بنویسید.`}
            confirmLabel="ثبت بازخورد"
            onClose={() => setIsFeedbackOpen(false)}
            onConfirm={() => {
              if (feedback.trim()) setFeedbackSaved(true);
              setIsFeedbackOpen(false);
            }}>
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              rows={4}
              autoFocus
              placeholder="متن بازخورد"
              className="w-full resize-y rounded-[10px] border border-line px-3 py-2.5 text-right"
            />
          </Dialog>
        )}
      </article>
    );
  }

  return (
    <div dir="ltr" className="w-full p-4">
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-surface py-2">
        <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm ${
                tab === activeTab
                  ? "rounded-2xl bg-[#23B2EF] text-white shadow-[0_8px_20px_rgba(29,155,240,0.35)]"
                  : "text-[#485261]"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-row-reverse items-center gap-1">
          <button
            type="button"
            onClick={toggleAllItems}
            aria-label={
              allItemsSelected ? "لغو انتخاب همه موارد" : "انتخاب همه موارد"
            }
            aria-pressed={allItemsSelected}
            className="relative flex h-10 w-10 items-center justify-center">
            <img src="/imges/checkbox.svg" alt="" className="h-5 w-5" />
            {allItemsSelected && (
              <Check
                aria-hidden="true"
                size={13}
                strokeWidth={3}
                className="absolute text-black"
              />
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen((previous) => !previous)}
              aria-expanded={isOpen}
              className="flex items-center gap-3 px-4 py-2 text-[15px] font-medium text-[#111827]">
              <span className="font-bold">صندوق ورودی</span>
              <span className="flex h-7 w-7 items-center justify-center">
                <img
                  src="/imges/dropdown.svg"
                  alt=""
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {isOpen && (
              <div className="absolute left-0 top-[calc(100%+12px)] z-20 w-[120px] rounded-[18px] border border-[#E5E7EB] bg-white p-2 shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedFilter(option);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-start rounded-xl border border-transparent px-3 py-2 text-right text-sm transition-colors ${
                      selectedFilter === option
                        ? "border-[#D9E8FF] bg-[#EAF4FF] text-[#23B2EF]"
                        : "text-[#374151] hover:bg-[#F3F6FB]"
                    }`}>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
