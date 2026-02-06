import { describe, expect, it } from "vitest";
import { computeBreach, computeDueAt } from "../lib/sla";

describe("SLA", () => {
  it("computes due date", () => {
    const start = new Date("2024-01-01T00:00:00Z");
    const due = computeDueAt(start, 60);
    expect(due.toISOString()).toBe("2024-01-01T01:00:00.000Z");
  });

  it("detects breach", () => {
    const due = new Date("2024-01-01T00:00:00Z");
    const now = new Date("2024-01-01T01:10:00Z");
    const result = computeBreach(due, now);
    expect(result.breached).toBe(true);
    expect(result.overdueMinutes).toBe(70);
  });
});
