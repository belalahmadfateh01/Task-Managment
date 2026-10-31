import Image from "next/image";
import StepProgress from "../StepProgress/page";
import Link from "next/dist/client/link";
export function LoginPage() {
  return (
    <section className="flex w-full h-screen ">
      <div
        className="bg-[#3F8EFC]
 w-1/2 px-20 py-30 flex justify-center items-center"
      >
        <div className=" text-right bg-white grid grid-col-1 gap-x-10  h-170 w-130 px-6 py-2 rounded-2xl pb-10">
          <Link
            href="/"
            className=" flex items-center justify-end  justify-items-end gap-x-2 gap-y- cursor-pointer"
          >
            <span className="text-[#3F8EFC] justify-items-end text-md font-demibold">
              بازگشت
            </span>
            <Image
              src="./imges/Vector.svg"
              alt="Arrow left"
              width={12}
              height={12}
              className="justify-items-end"
            />
          </Link>
          <h2 className="text-3xl font-bold">راه اندازی حساب کاربری</h2>
          <StepProgress />
          <form className="grid grid-cols-1 gap-10" action="">
            <div className="grid grid-cols-1 gap-1">
              <label className="text-xl font-semibold px-1" htmlFor="">
                نام کاربری
              </label>
              <input
                className="text-right border-gray-300 border-[0.5] rounded-xl px-4 py-2"
                id="email"
                name="email"
                placeholder="احمد"
                type="email"
              />
            </div>
            <div className="grid grid-cols-1 gap-1">
              <label htmlFor="" className="text-xl font-semibold px-1 ">
                رمز عبور
              </label>
              <input
                className="text-right border-gray-300 border-[0.5] rounded-xl px-4 py-2"
                id="password"
                name="password"
                placeholder="ahmad123@"
                type="password"
              />
            </div>
            <button className="text-white bg-[#3F8EFC] rounded-xl text-center font-bold text-xl py-2 cursor-pointer">
              ورود
            </button>
          </form>
        </div>
      </div>
      <div className="w-1/2 flex justify-center items-center">
        <Image
          className="w-180 h-180"
          src="./imges/Frame 9.svg"
          alt="Next.js logo"
          width={300}
          height={300}
          priority
        />
      </div>
    </section>
  );
}
