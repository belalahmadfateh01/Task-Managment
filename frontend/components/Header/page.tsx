import Image from "next/image";

export function Header() {
  return (
    <header className="bg-white flex ">
      <div className="max-w-7xl mx-auto py-4 px-4  flex flex-col justify-between">
        <h1 className="text-3xl font-bold">نمای کلی</h1>
        <p>خلاصه وضعیت عملکرد و گزارش های اخیر</p>
      </div>
      <div className="max-w-7xl mx-auto py-4 px-4  flex items-center justify-between gap-4">
        <div className="flex border-1 border-gray-400 p-2 rounded-xl">
          <input type="date" value="" />
          <input type="time" />
        </div>
        <div className="border-1 border-gray-400 rounded-xl p-3">
          <Image
            className="w-5 h-5"
            src="./imges/Vector (1).svg"
            alt="Next.js logo"
            width={50}
            height={50}
            priority
          />
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
