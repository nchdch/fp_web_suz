"use client";

import { useState } from "react";

export default function NewTicketPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        priority,
        source: "WEB"
      })
    });
    if (res.ok) {
      setMessage("Тикет создан");
      setTitle("");
      setDescription("");
    } else {
      setMessage("Ошибка создания тикета");
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">Создать тикет</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Заголовок</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Описание</label>
          <textarea
            className="mt-1 w-full rounded border px-3 py-2"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Приоритет</label>
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        <button className="rounded bg-slate-900 px-3 py-2 text-white">Создать</button>
      </form>
    </div>
  );
}
