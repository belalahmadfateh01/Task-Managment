"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
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
  assignments: Assignment[];
};

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const teachers = employees.filter((employee) => employee.role === "teacher");

  const resetForm = () => {
    setTaskToEdit(null);
    setTeacherId("");
    setTitle("");
    setDescription("");
    setStartDate("");
    setDeadline("");
    setError("");
  };

  const load = async () => {
    setError("");
    try {
      const [taskRows, employeeRows] = await Promise.all([
        api<Task[]>("/task?limit=100"),
        api<EmployeeRow[]>("/employee?limit=100"),
      ]);
      setTasks(taskRows);
      setEmployees(employeeRows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "بارگذاری وظایف ناموفق بود.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || (!taskToEdit && !teacherId)) {
      setError(taskToEdit ? "عنوان فعالیت را وارد کنید." : "عنوان فعالیت و کارمند را انتخاب کنید.");
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
      if (taskToEdit) {
        await api<Task>(`/task/${taskToEdit.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await api<Task>("/task", {
          method: "POST",
          body: JSON.stringify({ ...payload, teacher_ids: [teacherId] }),
        });
      }
      resetForm();
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ثبت وظیفه ناموفق بود.");
    } finally {
      setSaving(false);
    }
  };

  const removeTask = async (id: string) => {
    setError("");
    try {
      await api(`/task/${id}`, { method: "DELETE" });
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "حذف وظیفه ناموفق بود.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <form onSubmit={createTask} className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-line bg-white">
        <header className="flex items-center gap-3 border-b border-blue-100 px-5 py-4 sm:px-7">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700">
            <Plus size={23} strokeWidth={1.7} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">{taskToEdit ? "ویرایش فعالیت" : "ایجاد فعالیت"}</h2>
            <p className="mt-1 text-xs text-slate-500">فعالیت‌های روزمره را برای اعضای تیم‌تان تعیین کنید.</p>
          </div>
        </header>
        <div className="grid gap-5 p-5 sm:p-7">
          {!taskToEdit && (
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              تعیین برای:
              <span className="relative">
                <select
                  required
                  value={teacherId}
                  onChange={(event) => setTeacherId(event.target.value)}
                  disabled={!teachers.length}
                  className="h-12 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pl-10 text-right text-sm font-normal text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-50"
                >
                  <option value="">{teachers.length ? "کارمند را انتخاب کنید" : "کارمندی برای واگذاری وجود ندارد"}</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.f_name} {teacher.l_name}</option>
                  ))}
                </select>
                <ChevronDown size={18} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </span>
            </label>
          )}
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
              rows={4}
              className="resize-y rounded-lg border border-slate-300 px-3 py-3 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-blue-500"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              تاریخ شروع
              <input
                type="date"
                value={startDate}
                max={deadline || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal text-blue-800 outline-none focus:border-blue-500"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
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
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={resetForm} className="h-11 min-w-32 rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              لغو
            </button>
            <button disabled={saving || (!taskToEdit && !teachers.length)} className="h-11 min-w-32 rounded-md bg-brand px-5 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? "در حال ذخیره…" : taskToEdit ? "ذخیره ویرایش" : "اضافه کردن"}
            </button>
          </div>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="font-bold text-slate-900">فعالیت‌های ثبت‌شده</h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری…</p>
        ) : tasks.length ? tasks.map((task) => (
          <article key={task.id} className="flex items-start justify-between gap-4 rounded-lg border border-line bg-white p-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900">{task.title}</h3>
              {task.description && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{task.description}</p>}
              <p className="mt-2 text-xs text-slate-500">
                {[task.start_date && `شروع: ${new Date(`${task.start_date.slice(0, 10)}T12:00:00`).toLocaleDateString("fa-IR")}`, task.deadline && `ختم: ${new Date(task.deadline).toLocaleDateString("fa-IR")}`].filter(Boolean).join(" · ") || "بدون تاریخ"}
                {" · "}
                {task.assignments.map((item) => `${item.teacher_f_name} ${item.teacher_l_name} (${({ pending: "در انتظار", in_progress: "در حال انجام", completed: "تکمیل‌شده" } as Record<string, string>)[item.status] ?? item.status})`).join("، ")}
              </p>
              {task.assignments.some((item) => item.response) && (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {task.assignments.filter((item) => item.response).map((item) => (
                    <div key={item.teacher_id} className="rounded-md bg-slate-50 p-3 text-sm">
                      <p className="text-xs font-semibold text-slate-700">پاسخ {item.teacher_f_name} {item.teacher_l_name}</p>
                      <p className="mt-1 whitespace-pre-wrap text-slate-600">{item.response}</p>
                      {item.responded_at && <p className="mt-1 text-[11px] text-slate-400">ارسال‌شده در {new Date(item.responded_at).toLocaleString("fa-IR")}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <button type="button" onClick={() => {
                setTaskToEdit(task);
                setTeacherId(task.assignments[0]?.teacher_id ?? "");
                setTitle(task.title);
                setDescription(task.description ?? "");
                setStartDate(task.start_date ? task.start_date.slice(0, 10) : "");
                setDeadline(task.deadline ? task.deadline.slice(0, 10) : "");
                setError("");
              }} aria-label={`ویرایش وظیفه ${task.title}`} className="rounded-md px-3 py-2 text-sm text-sky-700 hover:bg-sky-50">ویرایش</button>
              <button type="button" onClick={() => setTaskToDelete(task)} aria-label={`حذف وظیفه ${task.title}`} className="rounded-md p-2 text-red-600 hover:bg-red-50">
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        )) : (
          <p className="rounded-lg border border-line bg-white px-4 py-10 text-center text-sm text-slate-500">هنوز وظیفه‌ای ثبت نشده است.</p>
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
