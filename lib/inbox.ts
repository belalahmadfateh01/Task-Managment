export type InboxAttachment = {
  id: string;
  name: string;
  size: string;
  url?: string;
  contentType?: string;
};

export type InboxReport = {
  id: number;
  sender: string;
  title: string;
  category: "خوانده شده" | "خوانده نشده";
  hasAttachment: boolean;
  createdAt: number;
  date: string;
  time: string;
  content?: string;
  attachmentName?: string;
  attachmentSize?: string;
  attachments?: InboxAttachment[];
};

export const reports: InboxReport[] = [
  {
    id: 1,
    sender: "احمد اکبری",
    title: "گزارش فعالیت روزانه",
    category: "خوانده نشده",
    hasAttachment: true,
    createdAt: 11,
    date: "1405/12/16",
    time: "2:35 PM",
    content:
      "امروز جلسه هماهنگی تیم برگزار شد و وضعیت پروژه‌های جاری بررسی گردید. طراحی صفحات داشبورد تحویل داده شد و بازخورد اولیه از تیم فنی دریافت شد.\n\nدر طول هفته، ۱۲ گزارش بررسی و ۹ مورد تأیید شد؛ میانگین زمان پاسخ‌گویی از ۴۸ به ۳۶ ساعت کاهش یافت. جدول عملکرد هفتگی در پیوست آمده است.\n\nبرنامه هفته آینده شامل تکمیل ماژول گزارش‌دهی و آزمون پذیرش با تیم مالی است. موارد پیگیری‌نشده در جلسه بعدی بررسی می‌شوند.",
    attachmentName: "Students.pdf",
    attachmentSize: "6.8 MB",
  },
  {
    id: 2,
    sender: "احمد اکبری",
    title: "عنوان گزارش در وسط قرار میگیرد",
    category: "خوانده نشده",
    hasAttachment: false,
    createdAt: 10,
    date: "1404/12/4",
    time: "10:20 PM",
  },
  {
    id: 3,
    sender: "احمد اکبری",
    title: "عنوان گزارش در وسط قرار میگیرد",
    category: "خوانده شده",
    hasAttachment: false,
    createdAt: 9,
    date: "1404/12/4",
    time: "10:20 PM",
  },
  {
    id: 4,
    sender: "احمد اکبری",
    title: "عنوان گزارش در وسط قرار میگیرد",
    category: "خوانده نشده",
    hasAttachment: false,
    createdAt: 8,
    date: "1404/12/4",
    time: "10:20 PM",
  },
  {
    id: 5,
    sender: "احمد اکبری",
    title: "عنوان گزارش در وسط قرار میگیرد",
    category: "خوانده نشده",
    hasAttachment: true,
    createdAt: 7,
    date: "1404/12/4",
    time: "01:08 PM",
  },
  {
    id: 6,
    sender: "احمد اکبری",
    title: "عنوان گزارش در وسط قرار میگیرد",
    category: "خوانده شده",
    hasAttachment: false,
    createdAt: 6,
    date: "1404/12/4",
    time: "10:20 PM",
  },
  {
    id: 7,
    sender: "احمد اکبری",
    title: "عنوان گزارش در وسط قرار میگیرد",
    category: "خوانده نشده",
    hasAttachment: true,
    createdAt: 5,
    date: "1404/12/4",
    time: "10:20 PM",
  },
  {
    id: 8,
    sender: "احمد اکبری",
    title: "عنوان گزارش در وسط قرار میگیرد",
    category: "خوانده نشده",
    hasAttachment: true,
    createdAt: 4,
    date: "1404/12/4",
    time: "10:20 PM",
  },
  {
    id: 9,
    sender: "احمد اکبری",
    title: "عنوان گزارش در وسط قرار میگیرد",
    category: "خوانده نشده",
    hasAttachment: true,
    createdAt: 3,
    date: "1404/12/4",
    time: "06:32 PM",
  },
  {
    id: 10,
    sender: "احمد اکبری",
    title: "عنوان گزارش در وسط قرار میگیرد",
    category: "خوانده نشده",
    hasAttachment: false,
    createdAt: 2,
    date: "1404/12/4",
    time: "10:20 PM",
  },
  {
    id: 11,
    sender: "احمد اکبری",
    title: "عنوان گزارش در وسط قرار میگیرد",
    category: "خوانده نشده",
    hasAttachment: false,
    createdAt: 1,
    date: "1404/12/4",
    time: "10:20 PM",
  },
];
