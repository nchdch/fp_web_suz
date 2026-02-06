import { addMinutes } from "date-fns";

export function computeDueAt(start: Date, resolutionMinutes: number) {
  return addMinutes(start, resolutionMinutes);
}

export function computeBreach(dueAt: Date, now: Date) {
  const breached = now.getTime() > dueAt.getTime();
  const overdueMinutes = breached ? Math.ceil((now.getTime() - dueAt.getTime()) / 60000) : 0;
  return { breached, overdueMinutes };
}
