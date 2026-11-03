import HomeSection from "@/components/HomeSection/page";
import Saidbar from "@/components/Saidbar/page";
import MainPage from "@/components/Main/page";

export default function Home() {
  return (
    <section className="flex w-full">
      <Saidbar />
      <div className=" w-full">
        <HomeSection />

        <MainPage />
      </div>
    </section>
  );
}
