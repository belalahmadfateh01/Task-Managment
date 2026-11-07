import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const dana = localFont({
  src: [
    { path: "../public/fonts/dana thin.ttf", weight: "100" },
    { path: "../public/fonts/dana extralight.ttf", weight: "200" },
    { path: "../public/fonts/dana light.ttf", weight: "300" },
    { path: "../public/fonts/dana regular.ttf", weight: "400" },
    { path: "../public/fonts/dana medium.ttf", weight: "500" },
    { path: "../public/fonts/dana demibold.ttf", weight: "600" },
    { path: "../public/fonts/dana bold.ttf", weight: "700" },
    { path: "../public/fonts/dana extrabold.ttf", weight: "800" },
    { path: "../public/fonts/dana black.ttf", weight: "900" },
  ],
  variable: "--font-dana",
  display: "swap",
});

export const metadata: Metadata = {
  title: "گزارش یار",
  description: "خلاصه وضعیت عملکرد و گزارش‌های اخیر",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={dana.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
