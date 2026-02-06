import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ticketing MVP",
  description: "MVP система учета заявок"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/dashboard" className="text-lg font-semibold">
              FP Ticketing
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/dashboard">Дашборд</Link>
              <Link href="/tickets">Тикеты</Link>
              <Link href="/admin/companies">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
