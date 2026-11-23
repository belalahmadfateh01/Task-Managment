"use client";
import { loginEmployee } from "@/services/employee.service";
import { Eye, EyeOff } from "lucide-react";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { writeSession } from "@/lib/clientStore";

const input =
  "h-[50px] w-full rounded-xl border border-gray-300 px-4 text-right text-sm placeholder:text-gray-400 focus:border-[#3F8EFC] focus:outline-none";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <section className="flex h-dvh overflow-hidden w-full">
      {/* blue panel (right in RTL) */}
      <div className="flex w-full items-center justify-center bg-[#3F8EFC] px-6 md:w-1/2 md:px-12 rounded-l-2xl">
        <div className="grid w-full max-w-[505px] grid-cols-1 gap-5 rounded-3xl bg-white p-6 pb-8 text-right shadow-xl md:p-8 ">
          <Link
            href="/"
            className="flex cursor-pointer items-center justify-end gap-x-2">
            <span className="text-xs font-semibold text-[#3F8EFC]">بازگشت</span>
            <Image src="/imges/Vector.svg" alt="" width={12} height={12} />
          </Link>

          <div className="grid gap-2">
            <h2 className="text-3xl font-bold text-slate-900">
              ورود به حساب کاربری
            </h2>
            <p className="text-sm text-gray-500">
              برای ورود، ایمیل و رمز عبور خود را وارد کنید
            </p>
          </div>

          <form
            className="grid grid-cols-1 gap-6"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setLoginError("");
              const formData = new FormData(event.currentTarget);
              const email = String(formData.get("email") ?? "")
                .trim()
                .toLowerCase();
              const password = String(formData.get("password") ?? "");
              try {
                const result = await loginEmployee<{
                  employee: { id: string; role: "admin" | "teacher" };
                }>("/employee/login", {
                  method: "POST",
                  body: JSON.stringify({ email, password }),
                });
                const { employee } = result;
                if (
                  !employee?.id ||
                  !["admin", "teacher"].includes(employee.role)
                )
                  throw new Error("پاسخ ورود معتبر نیست.");
                writeSession({ role: employee.role, employeeId: employee.id });
                router.push(
                  employee.role === "admin"
                    ? "/dashboard"
                    : "/employee/dashboard",
                );
              } catch (error) {
                setLoginError(
                  error instanceof Error ? error.message : "ورود ناموفق بود.",
                );
              } finally {
                setLoading(false);
              }
            }}>
            <div className="grid grid-cols-1 gap-2">
              <label className="px-1 text-lg font-semibold" htmlFor="email">
                ایمیل
              </label>
              <input
                className={`${input} text-left`}
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
                dir="ltr"
                autoComplete="email"
                required
                onInvalid={(e: FormEvent<HTMLInputElement>) =>
                  e.currentTarget.setCustomValidity(
                    "لطفاً ایمیل خود را وارد کنید",
                  )
                }
                onInput={(e: FormEvent<HTMLInputElement>) =>
                  e.currentTarget.setCustomValidity("")
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="password" className="px-1 text-lg font-semibold">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  className={input}
                  id="password"
                  name="password"
                  placeholder="رمز عبور خود را وارد کنید"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  onInvalid={(e: FormEvent<HTMLInputElement>) =>
                    e.currentTarget.setCustomValidity("رمز عبور الزامی است")
                  }
                  onInput={(e: FormEvent<HTMLInputElement>) =>
                    e.currentTarget.setCustomValidity("")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-100 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>
            {loginError && (
              <p role="alert" className="-mt-3 text-sm text-red-600">
                {loginError}
              </p>
            )}
            <button
              disabled={loading}
              className="mt-2 h-[50px] cursor-pointer rounded-xl bg-[#3F8EFC] text-center text-lg font-bold text-white transition hover:bg-blue-600"
              type="submit">
              {loading ? "در حال ورود…" : "ورود"}
            </button>
          </form>
        </div>
      </div>

      {/* illustration (left in RTL) */}
      <div className="hidden w-1/2 items-center justify-center bg-[#F6F6F6] md:flex">
        <Image
          className="h-auto w-full max-w-[600px]"
          src="/imges/Frame 9.svg"
          alt=""
          width={600}
          height={600}
          priority
        />
      </div>
    </section>
  );
}
