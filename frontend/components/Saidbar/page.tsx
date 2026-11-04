import Image from "next/image";
import { text } from "stream/consumers";
import Link from "next/link";
export default function Saidar() {
  const saides = [
    {
      text: "صفحه اصلی",
      logo: "./imges/home.svg",
      href: "/feed",
      label: "Home",
      icon: "home",
    },
    {
      text: "صندوق ورودی",
      logo: "/imges/Icons (2).svg",
      href: "/feed",
      label: "Home",
      icon: "e",
    },
    {
      text: "کارمندان",

      logo: "/imges/Group (2).svg",
      href: "/feed",
      label: "Home",
      icon: "o",
    },
    {
      text: "پیش نویس",

      logo: "/imges/Vector (5).svg",
      href: "/feed",
      label: "H",
      icon: "h",
    },
  ];

  return (
    <section className="w-80 bg-[#3F8EFC] flex flex-col gap-6 px-4 py-6 ">
      <div className="flex justify-center items-center gap-6 py-2 border-2 border-white rounded-2xl w-60">
        <Image
          src="./imges/LOGO.svg"
          alt="Arrow left"
          width={12}
          height={12}
          className="w-18"
        />
        <h2 className="text-white text-3xl">گزارش یار</h2>
      </div>
      <div>
        {saides.map((saide) => {
          return (
            <div
              key={saide.href}
              className="flex justify-start
            gap-4 w-60 items-center  py-2 px-4 "
            >
              <Image
                src={saide.logo}
                alt="Arrow left"
                width={12}
                height={12}
                className="w-12 h-12"
              />
              <Link href={saide.href} className="text-white text-2xl font-medium">
                {saide.text}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
