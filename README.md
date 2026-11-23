# گزارش‌یار (Task Management)

گزارش‌یار یک سامانهٔ فارسی و راست‌چین برای مدیریت گزارش‌های کارمندان است. مدیر می‌تواند گزارش‌ها را بررسی کند، بازخورد بدهد، کارمندان و وظایف را مدیریت کند؛ کارمند نیز گزارش بسازد، پیش‌نویس نگه دارد و وضعیت وظایفش را پیگیری کند.

## فناوری‌ها

- **Frontend:** Next.js 15، React 19، TypeScript و Tailwind CSS
- **Backend:** Node.js، Express 5 و PostgreSQL
- **احراز هویت:** JWT در کوکی `HttpOnly`؛ کنترل دسترسی بر اساس نقش `admin` یا `teacher`

## پیش‌نیازها

- Node.js نسخهٔ **20.6 یا جدیدتر** و npm
- PostgreSQL
- دسترسی کاربر دیتابیس برای ساخت جداول و اجرای migrationها

## راه‌اندازی محلی

### اجرای پروژه با Docker

Docker و Docker Compose را نصب کنید، سپس در ریشهٔ پروژه فایل تنظیمات را بسازید و مقادیر نمونه را عوض کنید:

```bash
cp .env.example .env
```

مقدار `DB_HOST` در فایل `.env` برای اجرای محلی `localhost` است؛ Compose آن را داخل شبکهٔ Docker به `db` تغییر می‌دهد. پیش از اجرا، `DB_PASSWORD`، `JWT_SECRET` (حداقل ۳۲ کاراکتر) و اطلاعات `ADMIN_*` را تنظیم کنید. سرویس‌های دیتابیس، migration، API و فرانت‌اند با این فرمان ساخته و اجرا می‌شوند:

```bash
docker compose up --build -d
```

برنامه در `http://localhost:3002` و API در `http://localhost:3001` در دسترس است. migrationها هنگام راه‌اندازی و پیش از API اجرا می‌شوند. برای ساخت مدیر اولیه:

```bash
docker compose run --rm api npm run admin:create
```

گزارش اجرا و وضعیت سرویس‌ها را ببینید یا همه را متوقف کنید:

```bash
docker compose ps
docker compose logs -f
docker compose down
```

دادهٔ PostgreSQL و فایل‌های آپلودشده در volumeهای Docker نگهداری می‌شوند و با `docker compose down` حذف نمی‌شوند. برای حذف کامل آن داده‌ها نیز `docker compose down -v` را اجرا کنید.

### ۱. نصب و تنظیم بک‌اند

از ریشهٔ پروژه وابستگی‌ها را نصب و فایل تنظیمات را بسازید:

```bash
npm ci
cp .env.example .env
```

در `.env` مقادیر PostgreSQL را وارد کنید. سپس دیتابیس معرفی‌شده در `DB_NAME` را در PostgreSQL بسازید؛ مقدار پیش‌فرض آن `task_management` است. قبل از ادامه، `JWT_SECRET` را با یک مقدار تصادفی و حداقل ۳۲ کاراکتری و مقادیر `ADMIN_*` را با اطلاعات امن مدیر اولیه تنظیم کنید.

ساخت جداول، ایجاد حساب مدیر و اجرای API:

```bash
npm run db:migrate
npm run admin:create
npm run dev
```

API به‌صورت پیش‌فرض روی `http://localhost:3001` اجرا می‌شود. فرمان migration را بعد از دریافت migrationهای جدید دوباره اجرا کنید؛ فایل‌های SQL اعمال‌شده در `schema_migrations` ثبت می‌شوند. فرمان `admin:create` فقط زمانی موفق است که هنوز مدیر ثبت نشده باشد.

### ۲. نصب و اجرای فرانت‌اند

در یک ترمینال دیگر:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

سپس برنامه را در `http://localhost:3000` باز کنید. به‌طور پیش‌فرض Next.js درخواست‌های `/api/*` و `/uploads/*` را از طریق proxy به بک‌اند می‌فرستد؛ مقدار `BACKEND_URL` در `frontend/.env` مقصد این proxy است.

## تنظیمات محیطی

### بک‌اند (`.env` در ریشه)

| متغیر | کاربرد |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | اتصال PostgreSQL؛ همه الزامی‌اند. |
| `JWT_SECRET` | کلید امضای نشست‌ها؛ حداقل ۳۲ کاراکتر. |
| `JWT_EXPIRE` | عمر توکن؛ پیش‌فرض `1d`. |
| `AUTH_COOKIE_SAME_SITE` | سیاست کوکی: `lax`، `strict` یا `none`؛ پیش‌فرض `lax`. |
| `PORT` | درگاه API؛ پیش‌فرض `3001`. |
| `CLIENT_ORIGINS` | مبدأهای مجاز مرورگر، جداشده با کاما؛ برای توسعه `http://localhost:3000`. |
| `TRUSTED_PROXIES` | IP یا CIDR پراکسی‌های مورداعتماد، جداشده با کاما؛ فقط پشت reverse proxy تنظیم شود. |
| `ADMIN_F_NAME`, `ADMIN_L_NAME`, `ADMIN_USER_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | اطلاعات مدیر اولیه برای `npm run admin:create`؛ رمز باید ۸ تا ۱۲۸ کاراکتر باشد. |

### فرانت‌اند (`frontend/.env`)

| متغیر | کاربرد |
| --- | --- |
| `BACKEND_URL` | آدرس بک‌اند برای rewriteهای Next.js؛ پیش‌فرض `http://localhost:3001`. |
| `NEXT_PUBLIC_API_URL` | اختیاری؛ اگر تنظیم شود، مرورگر مستقیماً API را صدا می‌زند. می‌تواند origin بک‌اند یا آدرس کامل `/api/v1` باشد. در این حالت origin فرانت‌اند را در `CLIENT_ORIGINS` بک‌اند مجاز کنید. |

اگر فرانت‌اند و API روی سایت‌های جداگانه هستند، `AUTH_COOKIE_SAME_SITE=none` را تنظیم کنید و هر دو را با HTTPS ارائه دهید. `.env` واقعی را در مخزن commit نکنید؛ فایل‌های `.env.example` فقط نمونه‌اند.

## قابلیت‌ها و صفحه‌ها

### مدیر

- داشبورد گزارش‌ها با نمای کلی و بازهٔ زمانی
- صندوق ورودی برای بررسی گزارش، تأیید، ثبت بازخورد، خوانده‌شدن و بایگانی
- مشاهده و حذف پیش‌نویس‌های ارسال‌نشدهٔ کارمندان
- مدیریت حساب کارمندان و اطلاعات پروفایل
- ساخت وظیفه، تعیین مهلت و واگذاری آن به یک یا چند کارمند
- مشاهدهٔ اعلان‌ها و وضعیت ارسال پاسخ وظیفه‌ها

صفحه‌ها: `/dashboard`، `/inbox`، `/drafts`، `/employees` و `/tasks`.

### کارمند

- داشبورد شخصی و فهرست گزارش‌های ارسالی
- ساخت گزارش، ذخیرهٔ پیش‌نویس و مشاهدهٔ بازخورد مدیر
- مشاهدهٔ وظیفه‌های واگذارشده، تغییر وضعیت و ارسال پاسخ
- ویرایش پروفایل، تصویر حساب و مشاهدهٔ اعلان‌ها

صفحه‌ها زیر `/employee/*` قرار دارند؛ برای نمونه `/employee/dashboard`، `/employee/inbox`، `/employee/tasks` و `/employee/drafts`.

وضعیت‌های گزارش در API عبارت‌اند از `draft`، `pending`، `accept` و `comment`. وضعیت وظیفه برای هر کارمند `pending`، `in_progress` یا `completed` است.

## API

نسخهٔ API زیر `/api/v1` است. مسیر سلامت `/health` وضعیت API و اتصال دیتابیس را گزارش می‌کند.

| بخش | مسیر پایه | کاربرد |
| --- | --- | --- |
| حساب‌ها | `/api/v1/employee` | ورود و خروج، پروفایل و مدیریت حساب‌ها |
| گزارش‌ها | `/api/v1/report` | ساخت، فهرست، بررسی، آمار، بایگانی و دریافت پیوست گزارش |
| بازخوردها | `/api/v1/comment` | ثبت و مشاهدهٔ بازخورد گزارش |
| وظیفه‌ها | `/api/v1/task` | واگذاری وظیفه، پیگیری وضعیت و ثبت پاسخ |
| اعلان‌ها | `/api/v1/notification` | فهرست اعلان‌ها و مدیریت خوانده‌شدن |

درخواست‌های دادهٔ برنامه به نشست معتبر نیاز دارند؛ `POST /api/v1/employee/login`، `POST /api/v1/employee/logout` و `/health` بدون نشست هستند. دسترسی هر مسیر با نقش کاربر کنترل می‌شود. ورود از `POST /api/v1/employee/login` انجام می‌شود و کوکی نشست به‌صورت `HttpOnly` تنظیم می‌شود.

## فایل‌ها و داده‌ها

- تصویر پروفایل: JPG، PNG یا WEBP تا ۲ مگابایت.
- پیوست گزارش: یک فایل برای هر گزارش، تا ۱۵ مگابایت؛ فرمت‌های PDF، تصویر، متن/CSV/RTF/JSON/Markdown، Word، Excel، PowerPoint، OpenDocument و آرشیو ZIP/7z/RAR/GZIP/TAR/BZIP2 پشتیبانی می‌شوند.
- فایل‌های بارگذاری‌شده در `uploads/` نگهداری و از Git مستثنا می‌شوند. برای پشتیبان‌گیری یا انتقال سرور، از دیتابیس و این پوشه با هم نسخهٔ پشتیبان بگیرید.

## بررسی پروژه

```bash
cd frontend
npm run typecheck
npm run build
```

در ریشه، `npm run db:migrate` برای اعمال تغییرات دیتابیس و `npm run admin:create` برای ایجاد مدیر اولیه در دسترس است. پروژه در حال حاضر اسکریپت خودکار test تعریف نکرده است.

برای اجرای نسخهٔ تولیدی، ابتدا بک‌اند را با `npm start` اجرا کنید و در پوشهٔ `frontend` این فرمان‌ها را بزنید:

```bash
npm run build
npm run start
```
