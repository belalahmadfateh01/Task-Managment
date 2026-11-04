import { Header } from "../Header/page";
import Image from "next/image";
const Home = [
  {
    text: "تایید شده ها",
    number: 1245,
    logo: "/imges/Group 58 (2).svg",
    id: 0,
    href: "/1",
  },
  {
    text: "تمام دریافتی ها",
    number: 1245,
    logo: "/imges/Group 58.svg",
    id: 1,
    href: "/1",
  },
  {
    text: "در انتظار",
    number: 1245,
    logo: "/imges/Group 58 (5).svg",
    id: 2,
    href: "/3",
  },
  {
    text: "بازخورد شده ها",
    number: 1245,
    logo: "/imges/Group 58 (6).svg",
    id: 3,
    href: "/4",
  },
];

export default function HomeSection() {
  return (
    <section className="bg-[#F2F5FA]">
      <Header />

      <div className="flex gap-12 mt-10 mx-7  px-10">
        {Home.map((item) => {
          return (
            <div
              key={item.id}
              className="grid grid-rows-2 
             w-70 items-center bg-white py-2 px-4  rounded-2xl"
            >
              <div className="flex justify-start gap-4 w-70 items-center  py-2 px-4 ">
                <Image
                  src={item.logo}
                  alt={item.text}
                  width={12}
                  height={12}
                  className="w-12 h-12"
                />
                <h5 className="text-[#777777] text-2xl font-medium ">
                  {item.text}
                </h5>
              </div>

              <p className="font-bold text-black text-3xl justify-self-end pl-8">
                {item.number}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
