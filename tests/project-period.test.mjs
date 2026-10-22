import test from "node:test";
import assert from "node:assert/strict";
import { parseProjectPeriod, projectPeriodResult } from "../src/lib/project-period.mjs";

test("Existing periods parse without rewriting free text or losing abbreviated months", () => {
  assert.equal(parseProjectPeriod("Mission 2024"), null);
  const range = parseProjectPeriod("Mars 2024 – Oct. 2025");
  assert.equal(range.startMonth, "3"); assert.equal(range.endMonth, "10");
  assert.equal(projectPeriodResult(range).value, "Mars 2024 – Octobre 2025");
  assert.equal(projectPeriodResult(parseProjectPeriod("Août 2024 – En cours")).value, "Août 2024 – En cours");
  assert.equal(projectPeriodResult(parseProjectPeriod("")).error, "");
});
test("Partial and reversed ranges are rejected; same-month and ongoing ranges remain valid", () => {
  const base = { startMonth: "3", startYear: "2024", endMonth: "2", endYear: "2024", ongoing: false };
  assert.ok(projectPeriodResult(base).error);
  assert.ok(projectPeriodResult({ ...base, endYear: "20" }).error);
  assert.equal(projectPeriodResult({ ...base, endMonth: "3" }).value, "Mars 2024 – Mars 2024");
  assert.equal(projectPeriodResult({ ...base, endMonth: "", endYear: "", ongoing: true }).value, "Mars 2024 – En cours");
});
