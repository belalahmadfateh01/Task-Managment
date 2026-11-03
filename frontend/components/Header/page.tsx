import Image from "next/image";
import DateTime from "../Date/page";
export function Header() {
  return (
    <header className="bg-white grid grid-cols-2 justify-between items-center w-full">
      <div className="mx-auto py-4 px-4 w-full flex flex-col items-start gap-2 ">
        <h1 className="text-3xl font-bold text-[#1E293B]">نمای کلی</h1>
        <p className="text-[#94A3B8]">خلاصه وضعیت عملکرد و گزارش های اخیر</p>
      </div>
      <div className=" mx-auto py-4 px-4  w-full flex gap-4 justify-end  ">
        <div className="flex border-2 border-gray-200 p-2 rounded-xl">
          <DateTime />
        </div>
        <div className="border-2 border-gray-200 rounded-xl p-3 relative">
          <Image
            className="w-5 h-5"
            src="./imges/boq.svg"
            alt="Next.js logo"
            width={50}
            height={50}
            priority
          />
          <div className="w-2 h-2 bg-red-500 rounded-full absolute top-2.5 right-3"></div>
        </div>
        <Image
          className="w-11 h-11"
          src="/imges/Photo.png"
          alt="Next.js logo"
          width={50}
          height={50}
          priority
        />
      </div>
    </header>
  );
}
