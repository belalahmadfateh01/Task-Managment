import Image from "next/image";
import Link from "next/link";

export default function Start() {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2">
      <section className="flex min-h-[50vh] flex-col items-center justify-center gap-6 bg-[#3F8EFC] px-6 py-10 text-white md:min-h-screen rounded-l-2xl" >
        <h1 className="text-center text-4xl pb-10 font-bold leading-14">
          گزارش های خود را به آسانی
          <span className="block">مدیریت کنید</span>
        </h1>
        <Image
          src="/imges/lines.png"
          alt="مراحل راه‌اندازی حساب کاربری، تنظیم کارکنان و مدیریت گزارش‌ها"
          width={280}
          height={280}
          className="h-auto w-full max-w-[400px]"
        />
        <Link
          
          href="/login"
          className="flex h-[50px] w-[144px] items-center justify-center rounded-xl bg-white font-bold text-[#3F8EFC] transition hover:bg-blue-50 absolute right-70 bottom-32"
        >
          شروع کنید
        </Link>
      </section>

      <section className="flex min-h-[50vh] items-center justify-center bg-white px-6 py-8 md:min-h-screen">
        <Image
          src="/imges/first.png"
          alt="تصویر مدیریت گزارش‌ها"
          width={704}
          height={704}
          priority
          className="h-auto w-full max-w-[500px] object-contain"
          sizes="(max-width: 767px) 90vw, 40vw"
        />
      </section>
    </main>
  );
}
