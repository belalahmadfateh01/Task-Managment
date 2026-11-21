"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { Pencil, UserRound, X } from "lucide-react";
import { api, apiAssetUrl } from "@/lib/api";
import { readSession } from "@/lib/clientStore";

export type EditableEmployeeProfile = {
  id: string;
  f_name: string;
  l_name: string;
  user_name: string;
  email: string;
  phone?: string | null;
  password?: number | string;
  address?: string | null;
  image?: string | null;
};

type ProfileEditorProps = {
  /** Set this to open the shared editor for a selected employee (admin view). */
  employeeId?: string;
  onClose?: () => void;
  onSaved?: (profile: EditableEmployeeProfile) => void;
};

const emptyProfile: EditableEmployeeProfile = {
  id: "",
  f_name: "",
  l_name: "",
  user_name: "",
  email: "",
  password: "",
};

export default function ProfileEditor({
  employeeId,
  onClose,
  onSaved,
}: ProfileEditorProps = {}) {
  const [profile, setProfile] = useState<EditableEmployeeProfile>(emptyProfile);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const isAdminEditingEmployee = Boolean(employeeId);
  const isOpen = isAdminEditingEmployee || open;

  const refresh = useCallback(async () => {
    const targetId = employeeId ?? readSession()?.employeeId;
    if (!targetId) {
      setError("حساب کارمند پیدا نشد.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setProfile(await api<EditableEmployeeProfile>(`/employee/${targetId}`));
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "بارگذاری پروفایل ناموفق بود.",
      );
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const closeEditor = () => {
    if (isAdminEditingEmployee) onClose?.();
    else setOpen(false);
  };

  const updateField = (
    key: "f_name" | "l_name" | "user_name" | "email" | "phone" | "address",
    value: string,
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await api<EditableEmployeeProfile>(
        `/employee/${profile.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            f_name: profile.f_name,
            l_name: profile.l_name,
            user_name: profile.user_name,
            email: profile.email,
            phone: profile.phone ?? "",
            address: profile.address ?? "",
          }),
        },
      );
      setProfile(updated);
      onSaved?.(updated);
      if (!isAdminEditingEmployee) {
        window.dispatchEvent(
          new CustomEvent("profile-updated", { detail: updated }),
        );
      }
      setNotice("مشخصات با موفقیت ذخیره شد.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "ذخیره مشخصات ناموفق بود.",
      );
    } finally {
      setBusy(false);
    }
  };

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("فرمت عکس باید JPG، PNG یا WEBP باشد.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("حجم عکس نباید بیشتر از ۲ مگابایت باشد.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      const endpoint = isAdminEditingEmployee
        ? `/employee/${profile.id}/profile/image`
        : "/employee/profile/image";
      const result = await api<EditableEmployeeProfile>(endpoint, {
        method: "PATCH",
        body,
      });
      setProfile((current) => ({ ...current, ...result }));
      onSaved?.(result);
      if (!isAdminEditingEmployee) {
        window.dispatchEvent(
          new CustomEvent("profile-updated", { detail: result }),
        );
      }
      setNotice("تصویر پروفایل به‌روز شد.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "بارگذاری تصویر ناموفق بود.",
      );
    } finally {
      setBusy(false);
    }
  };

  const initials =
    `${profile.f_name?.[0] ?? ""}${profile.l_name?.[0] ?? ""}` || "؟";

  return (
    <>
      {!isAdminEditingEmployee && (
        <button
          type="button"
          // onClick={() => {
          //   setOpen(true);
          //   setError("");
          //   setNotice("");
          //   void refresh();
          // }}
          className="relative grid size-11 shrink-0 place-items-center overflow-hidden  rounded-full bg-slate-600 font-bold text-white"
          aria-label="ویرایش پروفایل"
          title="عکس پروفایل">
          {profile.image ? (
            <Image
              src={apiAssetUrl(profile.image)}
              alt="تصویر پروفایل"
              fill
              sizes="44px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span>{initials}</span>
          )}
          {/* <span className="absolute bottom-0 right-0 grid size-4 place-items-center rounded-full bg-white text-slate-700"><Pencil size={10} /></span> */}
        </button>
      )}

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 p-4"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeEditor();
            }}>
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-editor-title"
              className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2
                    id="profile-editor-title"
                    className="text-lg font-bold text-slate-900">
                    ویرایش پروفایل
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {isAdminEditingEmployee
                      ? "اطلاعات پروفایل کارمند را به‌روز کنید."
                      : "اطلاعات حساب خود را به‌روز کنید."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-lg p-2 text-red-500 bg-red-100 hover:scale-105 transition"
                  aria-label="بستن">
                  <X size={18} />
                </button>
              </div>
              {loading ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  در حال بارگذاری پروفایل…
                </p>
              ) : (
                <>
                  <div className="mb-5 flex items-center gap-4">
                    <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-xl font-bold text-slate-600">
                      {profile.image ? (
                        <Image
                          src={apiAssetUrl(profile.image)}
                          alt="تصویر پروفایل"
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <UserRound size={30} />
                      )}
                    </div>
                    <label className="cursor-pointer rounded-md border border-line px-3 py-2 text-sm font-medium hover:bg-slate-50">
                      تغییر تصویر
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={busy || !profile.id}
                        onChange={uploadPhoto}
                      />
                    </label>
                    <span className="text-xs text-slate-500">
                      JPG، PNG یا WEBP · تا ۲ مگابایت
                    </span>
                  </div>
                  {error && (
                    <p
                      role="alert"
                      className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      {error}
                    </p>
                  )}
                  {notice && (
                    <p
                      role="status"
                      className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                      {notice}
                    </p>
                  )}
                  {profile.id && (
                    <form
                      onSubmit={saveProfile}
                      className="grid gap-3 sm:grid-cols-2">
                      {(
                        [
                          ["f_name", "نام"],
                          ["l_name", "تخلص"],
                          ["user_name", "نام کاربری"],
                          ["email", "ایمیل"],
                          ["phone", "شماره تلفن"],
                          ["password", "پسورد"],

                          ["address", "نشانی"],
                        ] as const
                      ).map(([key, label]) => (
                        <label
                          key={key}
                          className={`grid gap-1.5 text-sm text-slate-700 ${key === "address" ? "sm:col-span-2" : ""}`}>
                          {label}
                          {key === "address" ? (
                            <textarea
                              value={profile.address ?? ""}
                              onChange={(event) =>
                                updateField(key, event.target.value)
                              }
                              maxLength={1000}
                              rows={2}
                              className="rounded-md border border-line px-3 py-2"
                            />
                          ) : (
                            <input
                              required={key !== "phone"}
                              type={key === "email" ? "email" : "text"}
                              value={profile[key] ?? ""}
                              onChange={(event) =>
                                updateField(key, event.target.value)
                              }
                              maxLength={key === "phone" ? 32 : undefined}
                              className="h-10 rounded-md border border-line px-3"
                            />
                          )}
                        </label>
                      ))}
                      <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                        <button
                          type="button"
                          onClick={closeEditor}
                          className="rounded-md border border-line px-4 py-2 text-sm">
                          انصراف
                        </button>
                        <button
                          disabled={busy}
                          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                          {busy ? "در حال ذخیره…" : "ذخیره تغییرات"}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
