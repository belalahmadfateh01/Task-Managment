# گزارش‌یار — فرانت‌اند

این Next.js app به API موجود در `../` وصل است.

```bash
npm install
cp .env.example .env
npm run dev
```

`BACKEND_URL` در `.env` باید به API اشاره کند (پیش‌فرض: `http://localhost:3001`). اگر API مستقیم از مرورگر فراخوانی می‌شود، `NEXT_PUBLIC_API_URL` را هم تنظیم کنید و مبدأ فرانت‌اند را در `CLIENT_ORIGINS` بک‌اند مجاز کنید.


برای بررسی TypeScript:

```bash
npm run typecheck
```

صفحه‌های مدیر در `/dashboard`, `/inbox`, `/employees` و `/tasks` هستند. پیش‌نویس‌ها و صفحه‌های کارمند زیر `/employee/*` قرار دارند. احراز هویت با کوکی HTTP-only انجام می‌شود.
