import Link from "next/link";

export default function HomePage() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">Система учета заявок</h1>
      <p className="mt-2 text-slate-600">
        MVP для аутсорсинговой IT-компании.
      </p>
      <Link href="/dashboard" className="mt-4 inline-block rounded bg-slate-900 px-3 py-2 text-white">
        Перейти в дашборд
      </Link>
    </div>
  );
}
