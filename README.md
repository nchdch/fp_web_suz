# FP Web SUZ (MVP)

## Архитектура и структура
- `app/` — Next.js App Router страницы и API роуты.
- `app/api` — REST эндпоинты (auth, tickets, comments, worklogs, attachments, admin).
- `lib/` — сервисы (SLA, события, email, auth), общие утилиты.
- `prisma/` — схема, миграции, seed.
- `tests/` — unit и интеграционные тесты.

## Шаги запуска (MVP)
1. **Инициализация и зависимости**
   ```bash
   npm install
   ```
2. **Prisma схема и миграции**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
3. **Seed данные**
   ```bash
   npm run seed
   ```
4. **Запуск приложения**
   ```bash
   npm run dev
   ```

## Локальный запуск
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

## Переменные окружения
Скопируйте `.env.example` в `.env` и заполните значения.

## Команды
- `npm run dev` — запуск dev сервера
- `npm run prisma:migrate` — миграции
- `npm run seed` — seed данные
- `npm run test` — тесты
