// import Image from "next/image";
function Start() {
  return (
    <div className="] grid  grid-cols-1 md:grid-cols-[45%_55%] w-full  h-screen items-center ">
      {/* information part right  */}
      <div className=" flex flex-col justify-center items-center border rounded-l-2xl bg-[#3F8EFC] text-[#FFFFFF] h-full   ">
        <h2 className=" text-2xl font-bold leading-10 text-center mb-10">
          گزارش های خود را به آسانی <span className="block">مدیریت کنی</span>
        </h2>
        <div className="">
          <img
            src="/imges/lines.png"
            alt="Description"
            width={320}
            height={1}
          />
        </div>
        <button className=" rounded-xl bg-white text-[#3F8EFC]  font-bold w-[120px] max-w-[144px] h-[50px] max-h-[60px] ml-53  ">
          شروع کنید
        </button>
      </div>

      {/* image left  */}
      <div>
        <img
          src="/imges/first.png"
          alt="Description"
          width={500}
          height={400}
          className="my-0 mx-auto"
        />
      </div>
    </div>
  );
}

export default Start;
