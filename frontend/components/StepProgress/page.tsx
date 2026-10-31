export default function StepProgress() {
  return (
    <div dir="rtl" className="w-full max-w-2xl">
      <p className="mb-5 text-right text-md text-gray-500">
        برای ادامه، نام کاربری و رمز عبور خود را ایجاد کنید
      </p>

      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm text-white font-bold">
          1
        </div>

        <div className="h-1 flex-1 rounded-full bg-gray-300 " />

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m5 12 4 4L19 6"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
