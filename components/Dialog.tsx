"use client";

import { useEffect } from "react";

interface Props {
  title: string;
  description?: string;
  confirmLabel: string;
  danger?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

export default function Dialog({ title, description, confirmLabel, danger, children, onConfirm, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/45 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        className="flex w-full max-w-[440px] flex-col gap-3 rounded-2xl bg-white p-6"
      >
        <h3 id="dlg-title" className="text-[1.15em] font-bold">
          {title}
        </h3>
        {description && <p className="text-[0.88em] text-slate-500">{description}</p>}
        {children}
        <div className="mt-2 flex gap-2.5">
          <button onClick={onClose} className="rounded-[10px] border border-line px-[18px] py-2 font-semibold hover:bg-surface">
            انصراف
          </button>
          <button
            onClick={onConfirm}
            autoFocus={!children}
            className={`rounded-[10px] px-[18px] py-2 font-semibold text-white ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-deep hover:bg-blue-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
