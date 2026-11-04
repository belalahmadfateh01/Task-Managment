"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function DateTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setNow(new Date());
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  const time = new Intl.DateTimeFormat("fa-AF", {
    timeZone: "Asia/Kabul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  const date = new Intl.DateTimeFormat("fa-AF-u-ca-persian", {
    timeZone: "Asia/Kabul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return (
    <div className="flex items-center rounded-xl p-1">
      <div className="flex justify-between gap-2">
        <Image
          className="w-5 h-5"
          src="./imges/Group.svg"
          alt="Next.js logo"
          width={10}
          height={10}
          priority
        />
        <p className="font-bold text-[#334155] text-gray-500">{date}</p>
        <h2
          className="font-bold border-r-2   border-gray-200 pr-2 text-[#0284C7]"
          dir="ltr"
        >
          {time}
        </h2>
      </div>
    </div>
  );
}
