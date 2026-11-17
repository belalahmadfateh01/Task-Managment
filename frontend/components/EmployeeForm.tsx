"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowRight,
  Camera,
  ImagePlus,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import type { Employee } from "@/lib/types";

interface EmployeeFormProps {
  onBack: () => void;
  onAdd: (
    employee: Omit<Employee, "id"> & {
      avatarFile?: File;
      firstName: string;
      lastName: string;
    },
  ) => boolean | string | Promise<boolean | string>;
}

type FieldErrors = Partial<
  Record<"name" | "lastName" | "email" | "password", string>
>;

const inputClass =
  "h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function EmployeeForm({ onBack, onAdd }: EmployeeFormProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("فرمت عکس باید JPG، PNG یا WEBP باشد.");
      event.currentTarget.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError("حجم عکس نباید بیشتر از ۲ مگابایت باشد.");
      event.currentTarget.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
        setPhotoFile(file);
        setFormError("");
      }
    };
    reader.onerror = () =>
      setFormError("خواندن عکس ناموفق بود. دوباره تلاش کنید.");
    reader.readAsDataURL(file);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = "وارد کردن نام الزامی است.";
    if (!lastName.trim()) nextErrors.lastName = "وارد کردن تخلص الزامی است.";
    if (!email.trim()) nextErrors.email = "وارد کردن ایمیل الزامی است.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "ایمیل واردشده معتبر نیست.";
    }
    if (password.trim().length < 8)
      nextErrors.password = "رمز عبور باید دست‌کم ۸ نویسه باشد.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await onAdd({
      name: `${name.trim()} ${lastName.trim()}`,
      firstName: name.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      avatar: photo ?? "/imges/Photo.png",
      avatarFile: photoFile,
      joinedAt: new Date().toISOString().slice(0, 10),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });
    if (typeof result === "string") setFormError(result);
    else if (!result) setFormError("افزودن کارمند ناموفق بود.");
  };

  const field = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: {
      required?: boolean;
      type?: string;
      dir?: "ltr";
      error?: string;
      autoComplete?: string;
    } = {},
  ) => (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>
        {label}
        {options.required && <span className="text-red-500"> *</span>}
      </span>
      <input
        className={`${inputClass} ${options.dir === "ltr" ? "text-left" : "text-right"}`}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        type={options.type ?? "text"}
        dir={options.dir}
        autoComplete={options.autoComplete}
        aria-invalid={Boolean(options.error)}
      />
      {options.error && (
        <span className="text-xs text-red-600">{options.error}</span>
      )}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="mx-auto w-full max-w-[980px]">
      <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex gap-2 px-3 py-2 text-sm font-medium text-blue-600"
        >
          <ArrowRight size={16} /> بازگشت
        </button>
        <h2 className="text-lg font-bold text-slate-900">اضافه کردن کارمند</h2>
      </div>

      <section className="mb-5 grid gap-4 rounded-lg border border-line bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5">
        <div className="flex items-center gap-2">
          <div className="relative grid size-[76px] place-items-center rounded-full border border-dashed border-blue-300 bg-blue-50 text-blue-500">
            {photo ? (
              <Image
                src={photo}
                alt="پیش‌نمایش تصویر پروفایل"
                fill
                unoptimized
                className="object-cover rounded-full "
              />
            ) : (
              <Camera size={23} />
            )}
            {photo && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                aria-label="حذف تصویر انتخاب‌شده"
                className="absolute -bottom-1 -right-1 z-10 grid size-7 place-items-center rounded-full border-white border-2 bg-blue-600 text-white"
              >
                <Plus size={13} />
              </button>
            )}
          </div>
          <div>
            <h3 className="font-semibold">تصویر پروفایل کارمند</h3>
            <p className="mt-1 text-xs text-slate-500">
              فرمت‌های مجاز JPG، PNG و WEBP، حداکثر ۲ مگابایت
            </p>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            انتخاب عکس
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={selectPhoto}
            className="sr-only"
            aria-label="انتخاب عکس پروفایل"
          />
        </div>
      </section>

      <section className="grid gap-x-5 gap-y-4 rounded-lg border border-line bg-white p-4 sm:grid-cols-2 sm:p-5">
        <h3 className="sm:col-span-2 flex items-center gap-2 border-b border-line pb-3 font-semibold">
          اطلاعات اولیه و حساب کاربری
        </h3>
        {field("نام", name, setName, { required: true, error: errors.name })}
        {field("تخلص", lastName, setLastName, {
          required: true,
          error: errors.lastName,
        })}
        {field(
          "ایمیل",
          email,
          (value) => {
            setEmail(value);
            setFormError("");
          },
          {
            required: true,
            type: "email",
            dir: "ltr",
            error: errors.email,
            autoComplete: "email",
          },
        )}
        {field("شماره تلفن", phone, setPhone, {
          type: "tel",
          dir: "ltr",
          autoComplete: "tel",
        })}
        {field("آدرس سکونت", address, setAddress)}
        {field("رمز عبور", password, setPassword, {
          required: true,
          type: "password",
          error: errors.password,
          autoComplete: "new-password",
        })}
      </section>

      {formError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {formError}
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-5">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-line px-7 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white"
        >
          لغو
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-deep"
        >
          <Plus size={17} /> اضافه کردن
        </button>
      </div>
    </form>
  );
}
