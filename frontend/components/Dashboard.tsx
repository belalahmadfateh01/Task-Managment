"use client";

import {
  Archive,
  ArchiveRestore,
  Check,
  MessageSquareText,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, apiAllPages, apiAssetUrl } from "@/lib/api";
import { toInputDate } from "@/lib/jalali";
import { STATUS_ORDER } from "@/lib/labels";
import { getRange, inRange } from "@/lib/period";
import type { CustomRange, PeriodKey, Report, Status } from "@/lib/types";
import Dialog from "./Dialog";
import DonutCard from "./DonutCard";
import ReportsTable from "./ReportsTable";
import StatCards from "./StatCards";

interface MenuState {
  id: string;
  top: number;
  left: number;
}
interface DialogState {
  kind: "feedback" | "delete";
  id: string;
}

const PAGE_SIZE = 8;
const MENU_W = 176;

export default function Dashboard() {
  const [now, setNow] = useState<Date | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoaded, setReportsLoaded] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>("daily");
  const [custom, setCustom] = useState<CustomRange>({ from: "", to: "" });
  const [view, setView] = useState<"active" | "archived">("active");
  const [showAll, setShowAll] = useState(false);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [note, setNote] = useState("");
  const [loadError, setLoadError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const n = new Date();
    const from = new Date(n);
    from.setDate(from.getDate() - 29);
    setNow(n);
    setCustom({ from: toInputDate(from), to: toInputDate(n) });
    apiAllPages<Record<string, unknown>>("/report")
      .then((rows) => {
        setReports(rows.map((row) => ({
          id: String(row.id), title: String(row.title ?? ""),
          sender: [row.f_name, row.l_name].filter(Boolean).join(" "),
          senderAvatar: apiAssetUrl(typeof row.image === "string" ? row.image : null),
          status: row.status === "accept" ? "approved" : row.status === "comment" ? "feedback" : "pending",
          createdAt: String(row.report_date ?? n.toISOString()), archived: Boolean(row.archived_at),
        })));
        setReportsLoaded(true);
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "بارگذاری گزارش‌ها ناموفق بود."));
  }, []);

  const range = useMemo(
    () => (now ? getRange(period, now, custom) : null),
    [now, period, custom],
  );

  const inPeriod = useMemo(
    () => (range ? reports.filter((r) => inRange(r, range)) : []),
    [reports, range],
  );

  const counts = useMemo(() => {
    const c: Record<Status, number> = { feedback: 0, approved: 0, pending: 0 };
    for (const r of inPeriod) c[r.status]++;
    return c;
  }, [inPeriod]);

  const allCounts = useMemo(() => {
    const c: Record<Status, number> = { feedback: 0, approved: 0, pending: 0 };
    for (const report of reports) c[report.status]++;
    return c;
  }, [reports]);

  const total = STATUS_ORDER.reduce((s, k) => s + allCounts[k], 0);
  const archivedCount = reports.filter((r) => r.archived).length;
  const viewRows = view === "archived"
    ? reports.filter((r) => r.archived)
    : reports.filter((r) => !r.archived);
  const rows = showAll ? viewRows : viewRows.slice(0, PAGE_SIZE);

  // Close the row menu on outside click / Escape / scroll / resize
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  const patch = (id: string, fn: (r: Report) => Report) =>
    setReports((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));

  const openMenu = (report: Report, button: HTMLButtonElement) => {
    if (menu?.id === report.id) return setMenu(null);
    const b = button.getBoundingClientRect();
    const left = Math.min(Math.max(8, b.left), window.innerWidth - MENU_W - 8);
    const below = b.bottom + 6;
    const top =
      below + 190 > window.innerHeight ? Math.max(8, b.top - 190 - 6) : below;
    setMenu({ id: report.id, top, left });
  };

  const menuReport = menu ? reports.find((r) => r.id === menu.id) : undefined;
  const dialogReport = dialog
    ? reports.find((r) => r.id === dialog.id)
    : undefined;

  const approve = async (id: string) => {
    try {
      await api(`/report/${id}`, { method: "PATCH", body: JSON.stringify({ status: "accept" }) });
      patch(id, (r) => ({ ...r, status: "approved" }));
    } catch (error) { setLoadError(error instanceof Error ? error.message : "ثبت تأیید ناموفق بود."); }
  };
  const toggleArchive = async (r: Report) => {
    try {
      const result = await api<{ archived_at: string | null }>(`/report/${r.id}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ archived: !r.archived }),
      });
      patch(r.id, (x) => ({ ...x, archived: Boolean(result.archived_at) }));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "تغییر بایگانی گزارش ناموفق بود.");
    }
  };

  if (!now || !range) {
    return <p className="text-slate-500">در حال بارگذاری…</p>;
  }

  return (
    <>
      {loadError && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>}
      <StatCards
        approved={reportsLoaded ? allCounts.approved : null}
        total={reportsLoaded ? total : null}
        pending={reportsLoaded ? allCounts.pending : null}
        feedback={reportsLoaded ? allCounts.feedback : null}
      />

      <div className="mt-(--gap) grid grid-cols-1 items-start gap-(--gap) lap:grid-cols-[minmax(0,1fr)_clamp(300px,27vw,410px)]">
        <ReportsTable
          rows={rows}
          totalRows={viewRows.length}
          view={view}
          onView={(v) => {
            setView(v);
            setShowAll(false);
          }}
          archivedCount={archivedCount}
          showAll={showAll}
          onToggleAll={() => setShowAll((s) => !s)}
          showDate
          onOpenMenu={openMenu}
        />
        <DonutCard
          period={period}
          onPeriod={(p) => {
            setPeriod(p);
            setShowAll(false);
          }}
          custom={custom}
          onCustom={setCustom}
          range={range}
          counts={counts}
        />
      </div>

      {menu && menuReport && (
        <div
          ref={menuRef}
          className="fixed z-50 flex flex-col rounded-xl border border-line bg-white p-1.5 shadow-xl"
          role="menu"
          style={{ top: menu.top, left: menu.left, width: MENU_W }}>
          {menuReport.status !== "approved" && (
            <button
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[0.9em] hover:bg-surface"
              onClick={() => {
                approve(menuReport.id);
                setMenu(null);
              }}>
              <Check size={16} /> تائید
            </button>
          )}
          <button
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[0.9em] hover:bg-surface"
            onClick={() => {
              setNote(menuReport.note ?? "");
              setDialog({ kind: "feedback", id: menuReport.id });
              setMenu(null);
            }}>
            <MessageSquareText size={16} /> بازخورد
          </button>
          <button
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[0.9em] hover:bg-surface"
            onClick={() => {
              void toggleArchive(menuReport);
              setMenu(null);
            }}>
            {menuReport.archived ? (
              <ArchiveRestore size={16} />
            ) : (
              <Archive size={16} />
            )}
            {menuReport.archived ? "خروج از بایگانی" : "بایگانی"}
          </button>
          <button
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[0.9em] text-red-600 hover:bg-red-50"
            onClick={() => {
              setDialog({ kind: "delete", id: menuReport.id });
              setMenu(null);
            }}>
            <Trash2 size={16} /> حذف
          </button>
        </div>
      )}

      {dialog?.kind === "feedback" && dialogReport && (
        <Dialog
          title="ثبت بازخورد"
          description={`برای «${dialogReport.title}» توضیح بنویسید تا فرستنده آن را ببیند.`}
          confirmLabel="ثبت بازخورد"
          onClose={() => setDialog(null)}
          onConfirm={() => {
            void api(`/comment/${dialogReport.id}`, { method: "POST", body: JSON.stringify({ text: note.trim() }) })
              .then(() => { patch(dialogReport.id, (r) => ({ ...r, status: "feedback", note: note.trim() })); setDialog(null); })
              .catch((error) => setLoadError(error instanceof Error ? error.message : "ثبت بازخورد ناموفق بود."));
          }}>
          <textarea
            className="w-full resize-y rounded-[10px] border border-line bg-white px-3 py-2.5"
            rows={4}
            value={note}
            autoFocus
            placeholder="متن بازخورد"
            onChange={(e) => setNote(e.target.value)}
          />
        </Dialog>
      )}

      {dialog?.kind === "delete" && dialogReport && (
        <Dialog
          title="حذف گزارش"
          description={`«${dialogReport.title}» برای همیشه حذف می‌شود و قابل بازگشت نیست.`}
          confirmLabel="حذف گزارش"
          danger
          onClose={() => setDialog(null)}
          onConfirm={() => {
            void api(`/report/${dialogReport.id}`, { method: "DELETE" })
              .then(() => { setReports((rs) => rs.filter((r) => r.id !== dialogReport.id)); setDialog(null); })
              .catch((error) => setLoadError(error instanceof Error ? error.message : "حذف گزارش ناموفق بود."));
          }}
        />
      )}
    </>
  );
}
