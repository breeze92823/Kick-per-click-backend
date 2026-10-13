import assert from "assert";

import { sanitizeProgress } from "../src/sanitize.js";

describe("sanitizeProgress", () => {
  it("rejects non-objects and bounds numbers", () => {
    assert.strictEqual(sanitizeProgress(null), null);
    assert.strictEqual(sanitizeProgress([1]), null);
    const out = sanitizeProgress({ wins: 1e40, kickPower: -5, playtime: NaN, level: 0, rebirths: 2.9, hack: "x" })!;
    assert.strictEqual(out.wins, 1e24);
    assert.strictEqual(out.kickPower, 0);
    assert.strictEqual(out.playtime, undefined);
    assert.strictEqual(out.level, 1);
    assert.strictEqual(out.rebirths, 2);
    assert.ok(!("hack" in out));
  });

  it("keeps known balls and legends and drops the rest", () => {
    const out = sanitizeProgress({
      owned: [3, 3, 1.5, -1, 21, "2", 5],
      equipped: 5,
      legends: ["pogbo", "pogbo", "bogus", 4],
      legend: "pogbo",
      invSlots: 99,
    })!;
    assert.deepStrictEqual(out.owned, [0, 3, 5]); // starter ball always present
    assert.strictEqual(out.equipped, 5);
    assert.deepStrictEqual(out.legends, ["pogbo"]);
    assert.strictEqual(out.legend, "pogbo");
    assert.strictEqual(out.invSlots, 13);
  });

  it("rejects an unknown equipped ball or legend, allows an empty legend", () => {
    assert.strictEqual(sanitizeProgress({ equipped: 99 })!.equipped, undefined);
    assert.strictEqual(sanitizeProgress({ equipped: 1.5 })!.equipped, undefined);
    assert.strictEqual(sanitizeProgress({ legend: "nope" })!.legend, undefined);
    assert.strictEqual(sanitizeProgress({ legend: "" })!.legend, "");
  });

  it("caps the free-spin progress and last-seen timestamp", () => {
    const out = sanitizeProgress({ freeOnline: 1e9, lastSeen: Date.now() + 1e12 })!;
    assert.strictEqual(out.freeOnline, 15 * 60);
    assert.ok(out.lastSeen! <= Date.now() + 25 * 60 * 1000);
  });
});
