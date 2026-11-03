const reports = [
  {
    id: 1,
    title: "درخواست بازبینی مجدد",
    sender: "احمد رضایی",
    status: "بازخورد شده",
    type: "feedback",
    date: "10 : 45 PM",
  },
  {
    id: 2,
    title: "فهرست شکایات متفرقه",
    sender: "محمد صمدی",
    status: "دریافت شده",
    type: "received",
    date: "10 : 45 PM",
  },
  {
    id: 3,
    title: "بررسی گزارشات مالیاتی",
    sender: "شکیب سهرابی",
    status: "تأیید شده",
    type: "approved",
    date: "10 : 45 PM",
  },
  {
    id: 4,
    title: "فهرست ترخیص همکاران سال ما...",
    sender: "حسین محمودی",
    status: "تأیید شده",
    type: "approved",
    date: "10 : 45 PM",
  },
];

const statistics = [
  { title: "دریافت شده", count: 156, color: "#4F83F7" },
  { title: "بازخورد شده", count: 156, color: "#F59E0B" },
  { title: "تأیید شده", count: 156, color: "#10B981" },
  { title: "در انتظار تأیید", count: 156, color: "#8B5CF6" },
];

const statusColors: Record<string, string> = {
  feedback: "bg-amber-100 text-amber-600",
  received: "bg-blue-50 text-blue-600",
  approved: "bg-emerald-100 text-emerald-600",
};

export default function MainPage() {
  return (
    <main
      dir="ltr"
      className="min-h-screen bg-[#F2F5FA] p-4 "
    >
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 lg:grid-cols-[436px_minmax(0,1fr)]">
        {/* Daily Reports */}
        <section
          dir="rtl"
          className="flex min-h-[780px] flex-col rounded-[19px] border border-[#C9D9F8] bg-white p-7"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black">گزارشات روزانه</h2>

            <button className="text-black" aria-label="باز و بسته کردن">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4 8h16a1 1 0 0 1 .7 1.7l-8 8a1 1 0 0 1-1.4 0l-8-8A1 1 0 0 1 4 8Z" />
              </svg>
            </button>
          </div>

          {/* Donut Chart */}
          <div className="flex flex-1 items-center justify-center py-10">
            <div
              className="relative flex h-[275px] w-[275px] items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(
                  from -90deg,
                  #F59E0B 0deg 86deg,
                  white 86deg 90deg,
                  #2563EB 90deg 270deg,
                  white 270deg 274deg,
                  #10B981 274deg 316deg,
                  white 316deg 320deg,
                  #8B5CF6 320deg 350deg,
                  white 350deg 360deg
                )`,
              }}
            >
              <div className="absolute inset-[31px] rounded-full bg-white" />
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-auto space-y-7 pb-14">
            {statistics.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-semibold text-black">
                    {item.title}
                  </span>
                </div>

                <span className="text-xl font-semibold text-black">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Reports */}
        <section
          dir="rtl"
          className="min-h-[780px] rounded-[19px] border border-[#C9D9F8] bg-white p-7 md:p-9"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-black">
                گزارشات اخیر
              </h1>

              <p className="mt-3 text-sm text-[#71809B]">
                آخرین گزارشات دریافت شده و بررسی شده
              </p>
            </div>

            <button className="mt-2 text-xs text-blue-500 hover:text-blue-700">
              نمایش همه (65)
            </button>
          </div>

          {/* Table */}
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-right">
              <thead>
                <tr className="text-sm text-[#71809B]">
                  <th className="pb-8 font-normal">عنوان گزارش</th>
                  <th className="pb-8 font-normal">فرستنده</th>
                  <th className="pb-8 font-normal">وضعیت</th>
                  <th className="pb-8 font-normal">تاریخ</th>
                  <th className="pb-8 text-center font-normal">اکشن</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="text-sm">
                    <td className="max-w-[190px] truncate py-3 font-semibold text-black">
                      {report.title}
                    </td>

                    <td className="whitespace-nowrap py-3 font-semibold text-black">
                      {report.sender}
                    </td>

                    <td className="py-3">
                      <span
                        className={`inline-flex min-w-[110px] justify-center rounded-full px-4 py-2 text-xs font-semibold ${
                          statusColors[report.type]
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td
                      dir="ltr"
                      className="whitespace-nowrap py-3 text-xs text-[#8792A8]"
                    >
                      {report.date}
                    </td>

                    <td className="py-3 text-center">
                      <button
                        aria-label="عملیات گزارش"
                        className="rounded-md px-3 text-lg font-bold text-[#71809B] hover:bg-gray-100"
                      >
                        ...
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
