import assert from "node:assert/strict";
import { test } from "node:test";
import type { CaptureResult } from "posthog-js";
import { isInjectedWalletError } from "@/lib/analytics";

function exception(type: string, value: string): CaptureResult {
  return {
    uuid: "test",
    event: "$exception",
    properties: { $exception_list: [{ type, value }] },
  };
}

test("drops the TypeError from an injected wallet script", () => {
  const result = exception(
    "TypeError",
    "undefined is not an object (evaluating 'window.ethereum.selectedAddress = undefined')",
  );
  assert.equal(isInjectedWalletError(result), true);
});

test("keeps other exceptions", () => {
  const result = exception(
    "TypeError",
    "undefined is not an object (evaluating 'station.tide')",
  );
  assert.equal(isInjectedWalletError(result), false);
});

test("keeps events that are not exceptions", () => {
  const result: CaptureResult = {
    uuid: "test",
    event: "$pageview",
    properties: { note: "window.ethereum" },
  };
  assert.equal(isInjectedWalletError(result), false);
});
