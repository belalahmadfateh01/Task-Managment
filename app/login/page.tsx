"use client";

import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StepProgress from "@/components/StepProgress";

const input =
  "h-[50px] w-full rounded-xl border border-gray-300 px-4 text-right text-sm placeholder:text-gray-400 focus:border-[#3F8EFC] focus:outline-none";

export default function LoginPage() {
  const router = useRouter();

  return (
    <section className="flex h-screen w-full">
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
              راه اندازی حساب کاربری
            </h2>
            <p className="text-sm text-gray-500">
              برای ادامه، نام کاربری و رمز عبور خود را ایجاد کنید
            </p>
          </div>

          <StepProgress />

          <form
            className="grid grid-cols-1 gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              router.push("/dashboard");
            }}>
            <div className="grid grid-cols-1 gap-2">
              <label className="px-1 text-lg font-semibold" htmlFor="username">
                نام کاربری
              </label>
              <input
                className={input}
                id="username"
                name="username"
                placeholder="احمد"
                type="text"
                autoComplete="username"
                required
                onInvalid={(e: FormEvent<HTMLInputElement>) =>
                  e.currentTarget.setCustomValidity(
                    "لطفاً نام خود را وارد کنید",
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
              <input
                className={input}
                id="password"
                name="password"
                placeholder="ahmad123@"
                type="password"
                autoComplete="new-password"
                required
                onInvalid={(e: FormEvent<HTMLInputElement>) =>
                  e.currentTarget.setCustomValidity("رمز عبور الزامی است")
                }
                onInput={(e: FormEvent<HTMLInputElement>) =>
                  e.currentTarget.setCustomValidity("")
                }
              />
            </div>
            <button
              className="mt-2 h-[50px] cursor-pointer rounded-xl bg-[#3F8EFC] text-center text-lg font-bold text-white transition hover:bg-blue-600"
              type="submit">
              ورود
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
