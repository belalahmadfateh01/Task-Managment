"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  ChevronDown,
  ClipboardPlus,
  Paperclip,
  Plus,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api, apiAllPages, downloadApiFile } from "@/lib/api";
import Dialog from "@/components/Dialog";

type EmployeeRow = {
  id: string;
  f_name: string;
  l_name: string;
  role: string;
};

type Assignment = {
  teacher_id: string;
  teacher_f_name: string;
  teacher_l_name: string;
  status: string;
  response?: string | null;
  responded_at?: string | null;
};

type Task = {
  id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  deadline?: string | null;
  file_name?: string | null;
  file_path?: string | null;
  file_size?: number | string | null;
  assignments: Assignment[];
};

const TASK_STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار انجام",
  in_progress: "در حال انجام",
  completed: "تکمیل‌شده",
};

const TASK_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
};

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeeLoadError, setEmployeeLoadError] = useState("");
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const menusContainerRef = useRef<HTMLDivElement>(null);
  // The admin-only /employee endpoint already returns teachers only.
  const teachers = employees;

  const resetForm = () => {
    setTaskToEdit(null);
    setSelectedTeacherIds([]);
    setTitle("");
    setDescription("");
    setStartDate("");
    setDeadline("");
    setAttachmentFile(null);
    setRemoveExistingFile(false);
    setFormOpen(false);
    setError("");
  };

  const load = async () => {
    setError("");
    setLoading(true);
    setEmployeesLoading(true);
    setEmployeeLoadError("");
    const [taskResult, employeeResult] = await Promise.allSettled([
      apiAllPages<Task>("/task"),
      apiAllPages<EmployeeRow>("/employee"),
    ] as const);
    const errors: string[] = [];
    if (taskResult.status === "fulfilled") {
      setTasks(taskResult.value);
    } else {
      errors.push(
        taskResult.reason instanceof Error
          ? taskResult.reason.message
          : "بارگذاری وظایف ناموفق بود.",
      );
    }
    if (employeeResult.status === "fulfilled") {
      setEmployees(employeeResult.value);
    } else {
      const message =
        employeeResult.reason instanceof Error
          ? employeeResult.reason.message
          : "بارگذاری کارمندان ناموفق بود.";
      setEmployeeLoadError(message);
      errors.push(message);
    }
    setError(errors.join(" "));
    setLoading(false);
    setEmployeesLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const closeMenusOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      menusContainerRef.current
        ?.querySelectorAll<HTMLDetailsElement>("details[open]")
        .forEach((menu) => {
          if (!menu.contains(target)) menu.open = false;
        });
    };

    document.addEventListener("pointerdown", closeMenusOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeMenusOnOutsidePointer);
  }, []);

  const createTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || (!taskToEdit && selectedTeacherIds.length === 0)) {
      setError(
        taskToEdit
          ? "عنوان فعالیت را وارد کنید."
          : "عنوان فعالیت و دست‌کم یک کارمند را انتخاب کنید.",
      );
      return;
    }
    if (startDate && deadline && startDate > deadline) {
      setError("تاریخ شروع نمی‌تواند بعد از تاریخ ختم باشد.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        start_date: startDate || null,
        deadline: deadline || null,
      };
      let body: BodyInit;
      if (taskToEdit) {
        body = JSON.stringify(payload);
      } else {
        body = JSON.stringify({ ...payload, teacher_ids: selectedTeacherIds });
      }
      if (attachmentFile || removeExistingFile) {
        const form = new FormData();
        for (const [key, value] of Object.entries(payload))
          form.append(key, value ?? "");
        if (!taskToEdit)
          form.append("teacher_ids", JSON.stringify(selectedTeacherIds));
        if (attachmentFile) form.append("file", attachmentFile);
        if (taskToEdit && removeExistingFile)
          form.append("remove_file", "true");
        body = form;
      }
      await api<Task>(taskToEdit ? `/task/${taskToEdit.id}` : "/task", {
        method: taskToEdit ? "PATCH" : "POST",
        body,
      });
      resetForm();
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "ثبت وظیفه ناموفق بود.",
      );
    } finally {
      setSaving(false);
    }
  };

  const selectAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("حجم پیوست نباید بیشتر از ۲ مگابایت باشد.");
      event.currentTarget.value = "";
      return;
    }
    const allowedExtensions = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".tif",
      ".tiff",
      ".txt",
      ".csv",
      ".md",
      ".rtf",
      ".json",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".odt",
      ".ods",
      ".odp",
      ".zip",
      ".7z",
      ".rar",
      ".gz",
      ".tar",
      ".bz2",
    ];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(extension)) {
      setError("فرمت پیوست پشتیبانی نمی‌شود.");
      event.currentTarget.value = "";
      return;
    }
    setAttachmentFile(file);
    setRemoveExistingFile(false);
    setError("");
  };

  const removeTask = async (id: string) => {
    setError("");
    try {
      await api(`/task/${id}`, { method: "DELETE" });
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "حذف وظیفه ناموفق بود.",
      );
    }
  };

  return (
    <div ref={menusContainerRef} className="mx-auto max-w-6xl space-y-5">
      {error && !formOpen && !taskToEdit && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {!taskToEdit && (
        <div className="flex justify-end">
          <button
            type="button"
            aria-expanded={formOpen}
            onClick={() => setFormOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus size={17} /> واگذاری فعالیت جدید
          </button>
        </div>
      )}
      {(formOpen || taskToEdit) && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) resetForm();
          }}>
          <form
            onSubmit={createTask}
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-title"
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-blue-100 bg-blue-50/60 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
                  <ClipboardPlus size={23} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 id="task-form-title" className="font-bold text-slate-900">
                    {taskToEdit ? "ویرایش فعالیت" : "جزئیات فعالیت"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    مسئول و مهلت انجام را مشخص کنید.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="بستن فرم فعالیت"
                onClick={resetForm}
                disabled={saving}
                className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50">
                <X size={21} />
              </button>
            </header>
            {error && (
              <p
                role="alert"
                className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:mx-7">
                {error}
              </p>
            )}
            <div className="grid gap-4 p-4 sm:p-6">
              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                عنوان فعالیت
                <input
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="عنوان فعالیت را بیان کنید"
                  className="h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-blue-500"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                توضیحات
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="توضیحات فعالیت را بیان کنید"
                  rows={3}
                  className="resize-y rounded-lg border border-slate-300 px-3 py-3 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-blue-500"
                />
              </label>
              <div
                className={`grid gap-4 ${taskToEdit ? "" : "sm:grid-cols-2"}`}>
                {!taskToEdit && (
                  <fieldset className="relative z-40 m-0 grid gap-2 border-0 p-0 text-sm font-semibold leading-5 text-slate-800">
                    <legend className="m-0 p-0">مسئول انجام</legend>
                    <details className="group relative">
                      <summary className="flex h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                        <span>
                          {selectedTeacherIds.length
                            ? `${selectedTeacherIds.length} کارمند انتخاب شده`
                            : "کارمندان را انتخاب کنید"}
                        </span>
                        <ChevronDown
                          size={18}
                          aria-hidden
                          className="shrink-0 text-slate-500 transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <div className="absolute inset-x-0 top-full z-[70] mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-300 bg-white p-2 shadow-lg">
                        {employeesLoading ? (
                          <p className="px-2 py-3 text-sm font-normal text-slate-500">
                            در حال بارگذاری کارمندان…
                          </p>
                        ) : employeeLoadError ? (
                          <p className="px-2 py-3 text-sm font-normal text-red-600">
                            بارگذاری کارمندان ناموفق بود
                          </p>
                        ) : teachers.length ? (
                          <div className="grid gap-2">
                            <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-900">
                              <span>انتخاب همه کارمندان</span>

                              <input
                                type="checkbox"
                                checked={
                                  teachers.length > 0 &&
                                  selectedTeacherIds.length === teachers.length
                                }
                                onChange={(e) =>
                                  setSelectedTeacherIds(
                                    e.target.checked
                                      ? teachers.map((teacher) => teacher.id)
                                      : [],
                                  )
                                }
                                className="size-4 shrink-0 accent-blue-600"
                              />
                            </label>
                            {teachers.map((teacher) => {
                              const checked = selectedTeacherIds.includes(
                                teacher.id,
                              );
                              return (
                                <label
                                  key={teacher.id}
                                  className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm font-normal transition-colors ${checked ? "border-blue-300 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50"}`}>
                                  <span>
                                    {teacher.f_name} {teacher.l_name}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      setSelectedTeacherIds((current) =>
                                        checked
                                          ? current.filter(
                                              (id) => id !== teacher.id,
                                            )
                                          : [...current, teacher.id],
                                      )
                                    }
                                    className="size-4 shrink-0 accent-blue-600"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="px-2 py-3 text-sm font-normal text-slate-500">
                            کارمندی برای واگذاری وجود ندارد
                          </p>
                        )}
                      </div>
                    </details>
                  </fieldset>
                )}
                <label className="grid text-sm font-semibold leading-5 text-slate-800">
                  تاریخ ختم
                  <input
                    type="date"
                    value={deadline}
                    min={startDate || undefined}
                    onChange={(event) => setDeadline(event.target.value)}
                    className="h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal text-blue-800 outline-none focus:border-blue-500"
                  />
                </label>
              </div>
              <div className="grid gap-2 text-sm font-semibold text-slate-800">
                <span>پیوست فایل</span>
                <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-xs font-normal text-slate-600 hover:bg-blue-50">
                  <span className="flex items-center gap-2">
                    <Upload size={16} /> فایل وظیفه (PDF، Office و تصویر؛ حداکثر
                    ۲ مگابایت)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.tif,.tiff,.txt,.csv,.md,.rtf,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.zip,.7z,.rar,.gz,.tar,.bz2"
                    onChange={selectAttachment}
                    className="sr-only"
                  />
                  <Paperclip size={16} />
                </label>
                {attachmentFile && (
                  <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-xs font-normal">
                    <span className="min-w-0 truncate">
                      {attachmentFile.name}{" "}
                      <span className="text-slate-500">
                        ({(attachmentFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label="حذف فایل انتخاب‌شده"
                      onClick={() => setAttachmentFile(null)}
                      className="mr-2 text-red-600">
                      <X size={16} />
                    </button>
                  </div>
                )}
                {taskToEdit?.file_name && !attachmentFile && (
                  <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-xs font-normal">
                    {removeExistingFile ? (
                      <span className="text-slate-500">
                        پیوست فعلی هنگام ذخیره حذف می‌شود.
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          taskToEdit.file_path &&
                          void downloadApiFile(
                            `/task/${taskToEdit.id}/file`,
                            taskToEdit.file_name!,
                          ).catch((cause) =>
                            setError(
                              cause instanceof Error
                                ? cause.message
                                : "بارگیری فایل ناموفق بود.",
                            ),
                          )
                        }
                        className="inline-flex min-w-0 items-center gap-2 truncate text-blue-700 hover:underline">
                        <Paperclip size={14} /> {taskToEdit.file_name}{" "}
                        {taskToEdit.file_size
                          ? `(${(Number(taskToEdit.file_size) / (1024 * 1024)).toFixed(1)} MB)`
                          : ""}
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={
                        removeExistingFile ? "بازگرداندن پیوست" : "حذف پیوست"
                      }
                      onClick={() =>
                        setRemoveExistingFile((removed) => !removed)
                      }
                      className="mr-2 shrink-0 text-red-600">
                      {removeExistingFile ? "بازگرداندن" : <X size={16} />}
                    </button>
                  </div>
                )}
              </div>
              <div className="pt-1">
                <button
                  disabled={
                    saving ||
                    (!taskToEdit &&
                      (!teachers.length ||
                        employeesLoading ||
                        !!employeeLoadError))
                  }
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                  <Send size={17} />
                  {saving
                    ? "در حال ذخیره…"
                    : taskToEdit
                      ? "ذخیره تغییرات"
                      : "ثبت و ارسال فعالیت"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-bold text-slate-900">فعالیت‌های ثبت‌شده</h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            در حال بارگذاری…
          </p>
        ) : tasks.length ? (
          tasks.map((task) => (
            <article
              key={task.id}
              className="flex flex-col gap-4 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">{task.title}</h3>
                {task.description && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                    {task.description}
                  </p>
                )}
                {task.file_name && task.file_path && (
                  <button
                    type="button"
                    onClick={() =>
                      task.file_path &&
                      void downloadApiFile(
                        `/task/${task.id}/file`,
                        task.file_name!,
                      ).catch((cause) =>
                        setError(
                          cause instanceof Error
                            ? cause.message
                            : "بارگیری فایل ناموفق بود.",
                        ),
                      )
                    }
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:underline">
                    <Paperclip size={14} /> {task.file_name}
                  </button>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {[
                    task.start_date &&
                      `شروع: ${new Date(`${task.start_date.slice(0, 10)}T12:00:00`).toLocaleDateString("fa-IR")}`,
                    task.deadline &&
                      `ختم: ${new Date(task.deadline).toLocaleDateString("fa-IR")}`,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "بدون تاریخ"}
                  {" · "}
                  کارمندان:{" "}
                  {task.assignments
                    .map(
                      (item) => `${item.teacher_f_name} ${item.teacher_l_name}`,
                    )
                    .join("، ") || "بدون واگذاری"}
                </p>
                {task.assignments.some((item) => item.response) && (
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    {task.assignments
                      .filter((item) => item.response)
                      .map((item) => (
                        <div
                          key={item.teacher_id}
                          className="rounded-md bg-slate-50 p-3 text-sm">
                          <p className="text-xs font-semibold text-slate-700">
                            پاسخ {item.teacher_f_name} {item.teacher_l_name}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-slate-600">
                            {item.response}
                          </p>
                          {item.responded_at && (
                            <p className="mt-1 text-[11px] text-slate-400">
                              ارسال‌شده در{" "}
                              {new Date(item.responded_at).toLocaleString(
                                "fa-IR",
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">
                <div className="flex flex-wrap items-center  gap-1.5">
                  {task.assignments.length ? (
                    task.assignments.map((item) => (
                      <span
                        key={item.teacher_id}
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${TASK_STATUS_STYLES[item.status] ?? "bg-slate-200 text-slate-700"}`}>
                        {task.assignments.length > 1 && (
                          <>
                            {item.teacher_f_name} {item.teacher_l_name}:{" "}
                          </>
                        )}

                        {TASK_STATUS_LABELS[item.status] ?? item.status}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">بدون واگذاری</span>
                  )}
                </div>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTaskToEdit(task);
                      setTitle(task.title);
                      setDescription(task.description ?? "");
                      setStartDate(
                        task.start_date ? task.start_date.slice(0, 10) : "",
                      );
                      setDeadline(
                        task.deadline ? task.deadline.slice(0, 10) : "",
                      );
                      setAttachmentFile(null);
                      setRemoveExistingFile(false);
                      setFormOpen(true);
                      setError("");
                    }}
                    aria-label={`ویرایش وظیفه ${task.title}`}
                    className="rounded-md px-3 py-2 text-sm text-sky-700 hover:bg-sky-50">
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskToDelete(task)}
                    aria-label={`حذف وظیفه ${task.title}`}
                    className="rounded-md p-2 text-red-600 hover:bg-red-50">
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-line bg-white px-4 py-10 text-center text-sm text-slate-500">
            هنوز وظیفه‌ای ثبت نشده است.
          </p>
        )}
      </section>
      {taskToDelete && (
        <Dialog
          title="حذف وظیفه"
          description={`«${taskToDelete.title}» و واگذاری‌های آن برای همیشه حذف می‌شود.`}
          confirmLabel="حذف وظیفه"
          danger
          onClose={() => setTaskToDelete(null)}
          onConfirm={() => {
            const id = taskToDelete.id;
            setTaskToDelete(null);
            void removeTask(id);
          }}
        />
      )}
    </div>
  );
}
