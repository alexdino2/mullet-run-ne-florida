import assert from "node:assert/strict";
import { test } from "node:test";
import { easterlyDirectionWeight } from "@/lib/wind";

const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;

test("full credit across the NE–E band", () => {
  for (const deg of [33.75, 45, 67.5, 90, 100]) {
    assert.equal(easterlyDirectionWeight(deg), 1, `${deg}°`);
  }
});

test("partial credit tapers just past E toward SE", () => {
  const w110 = easterlyDirectionWeight(110);
  const w130 = easterlyDirectionWeight(130);
  assert.ok(close(w110, 1 - 8.75 / 67.5));
  assert.ok(w110 > w130 && w130 > 0);
  assert.equal(easterlyDirectionWeight(168.75), 0);
  assert.equal(easterlyDirectionWeight(180), 0);
});

test("partial credit tapers on the north side and wraps through 360°", () => {
  assert.ok(close(easterlyDirectionWeight(0), 1 - 33.75 / 67.5));
  assert.ok(close(easterlyDirectionWeight(350), 1 - 43.75 / 67.5));
  assert.ok(close(easterlyDirectionWeight(-10), easterlyDirectionWeight(350)));
  assert.equal(easterlyDirectionWeight(326.25), 0);
});

test("offshore westerlies get no credit", () => {
  for (const deg of [200, 225, 270, 300]) {
    assert.equal(easterlyDirectionWeight(deg), 0, `${deg}°`);
  }
});
