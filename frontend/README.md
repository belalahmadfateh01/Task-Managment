# Frontend guide — Task Management

این پوشه رابط کاربری پروژه مدیریت گزارش استادان است. استاد گزارش ایجاد و پیگیری می‌کند و مدیر گزارش‌ها را بررسی، تأیید یا کامنت‌گذاری می‌کند.

## شروع پروژه

```bash
cd frontend
npm install
npm run dev
```

رابط در `http://localhost:3000` اجرا می‌شود. بک‌اند نیز به‌طور پیش‌فرض روی همین پورت اجرا می‌شود؛ هنگام توسعه، یکی از آن‌ها را روی پورت دیگری اجرا کنید (مثلاً فرانت روی `3001`).

در `.env.local` فرانت، آدرس API را قرار دهید:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## ورود و احراز هویت

با `POST /employee/login` وارد شوید:

```json
{
  "email": "teacher@example.com",
  "password": "your-password"
}
```

پاسخ موفق شامل `token` است. آن را در `localStorage` یا ترجیحاً یک cookie امن نگهداری کنید و در درخواست‌های محافظت‌شده بفرستید:

```http
Authorization: Bearer <token>
```

نقش‌ها `teacher` و `admin` هستند. پس از ورود، کاربر را بر اساس نقش به داشبورد مربوط منتقل کنید.

## قرارداد پاسخ API

دادهٔ اصلی پاسخ موفق در `message` قرار دارد:

```json
{
  "success": true,
  "statusCode": 200,
  "message": {}
}
```

برای `401` توکن را پاک کرده و کاربر را به ورود منتقل کنید؛ برای `403` پیام «اجازه دسترسی ندارید» نشان دهید.

## صفحه‌های پیشنهادی

### استاد

- `/login`: ورود
- `/teacher/dashboard`: آمار و گزارش‌های اخیر
- `/teacher/reports`: فهرست و فیلتر گزارش‌های خود
- `/teacher/reports/new`: ثبت گزارش
- `/teacher/reports/[id]`: جزئیات، وضعیت و کامنت مدیر
- `/profile`: ویرایش مشخصات

### مدیر

- `/admin/dashboard`: آمار کلی گزارش‌ها
- `/admin/reports`: فهرست، جست‌وجو و فیلتر تمام گزارش‌ها
- `/admin/reports/[id]`: مشاهده، تغییر وضعیت و ثبت کامنت
- `/admin/employees`: فهرست و ایجاد حساب استاد

## API گزارش‌ها

Base URL: `/api/v1/report`

| عملیات | Endpoint | نقش مجاز | بدنه/پارامتر |
| --- | --- | --- | --- |
| ثبت گزارش | `POST /` | teacher | `title`, `text`, `file_name`, `status` |
| همه گزارش‌ها | `GET /` | admin | فیلترهای زیر |
| گزارش‌های یک استاد | `GET /teacher/:teacherId` | همان استاد یا admin | فیلترهای زیر |
| جزئیات گزارش | `GET /:id` | مالک یا admin | — |
| ویرایش گزارش | `PATCH /:id` | مالک یا admin | استاد: `title`, `text`, `file_name`؛ مدیر: `status` |
| حذف گزارش | `DELETE /:id` | مالک یا admin | — |
| آمار همه گزارش‌ها | `GET /stats` | کاربر واردشده | — |
| آمار یک استاد | `GET /teacher/:teacherId/stats` | همان استاد یا admin | — |

وضعیت‌ها: `pending`، `accept` و `comment`.

### فیلترهای گزارش

این query parameterها برای لیست تمام گزارش‌ها و لیست گزارش‌های استاد قابل استفاده‌اند:

```text
?status=pending&startDate=2026-01-01&endDate=2026-01-31
&user_name=ahmad&title=weekly&file_name=report.pdf
```

- `status`: یکی از وضعیت‌های بالا
- `startDate` و `endDate`: فرمت `YYYY-MM-DD`
- `user_name`: نام، نام خانوادگی، نام کاربری یا ایمیل استاد
- `title` و `file_name`: جست‌وجوی متنی

فیلترها را در URL نگه دارید تا با refresh و دکمه Back مرورگر حفظ شوند.

## API کامنت‌ها

Base URL: `/api/v1/comment`

| عملیات | Endpoint | نقش مجاز | بدنه |
| --- | --- | --- | --- |
| افزودن کامنت | `POST /:reportId` | admin | `{ "text": "..." }` |
| کامنت‌های یک گزارش | `GET /:reportId` | مالک یا admin | — |
| همه کامنت‌ها | `GET /` | admin | — |
| ویرایش کامنت | `PATCH /:id` | admin | `{ "text": "..." }` |
| حذف کامنت | `DELETE /:id` | admin | — |

ثبت کامنت، وضعیت گزارش را به `comment` تغییر می‌دهد؛ در داشبورد استاد آن را با نشان «نیاز به اصلاح» نمایش دهید.

## API کاربران

Base URL: `/api/v1/employee`

| عملیات | Endpoint | نقش مجاز |
| --- | --- | --- |
| ورود | `POST /login` | عمومی |
| ساخت کاربر | `POST /register` | admin |
| همه کاربران | `GET /` | admin |
| یک کاربر | `GET /:id` | همان کاربر یا admin |
| ویرایش پروفایل | `PATCH /:id` | همان کاربر |
| حذف کاربر | `DELETE /:id` | همان کاربر یا admin |

فیلدهای قابل ویرایش: `f_name`، `l_name`، `user_name`، `email` و `phone`.

## نکات پیاده‌سازی

- یک wrapper مرکزی برای `fetch` بسازید تا URL پایه، Authorization و مدیریت خطا یک‌جا باشند.
- برای هر درخواست loading و برای خطا پیام قابل‌فهم نشان دهید.
- تاریخ‌ها را با timezone کاربر نمایش دهید.
- رنگ وضعیت‌ها: pending زرد، accept سبز و comment نارنجی/قرمز.
- فقط کنترل‌هایی را نمایش دهید که با نقش کاربر مجاز هستند.

## پیش از تحویل

```bash
npm run lint
npm run build
```

مسیرهای اصلی را با هر دو نقش teacher و admin آزمایش کنید؛ مخصوصاً محدودیت‌های دسترسی به گزارش و کامنت.
