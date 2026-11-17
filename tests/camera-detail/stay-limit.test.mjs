import assert from "node:assert/strict";
import { test } from "node:test";
import { ANALYTIC_PARAM_SPECS } from "../../features/camera-detail/lib/analytic-param-specs.ts";
import {
  paramError,
  paramLabel,
} from "../../features/camera-detail/lib/edit-analytic-params.ts";
import { perimetersSchema } from "../../lib/api/perimeters.ts";

const area = {
  name: "Door",
  polygon: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ],
};

test("an area no longer carries a stay limit", () => {
  const parsed = perimetersSchema.parse({
    areas: [{ ...area, max_stay_seconds: 30 }],
    lines: [],
  });
  assert.equal("max_stay_seconds" in parsed.areas[0], false);
});

test("the stay limit is a camera param of the two dwelling analytics only", () => {
  const holders = Object.entries(ANALYTIC_PARAM_SPECS)
    .filter(([, specs]) =>
      specs.some((spec) => spec.key === "max_stay_seconds"),
    )
    .map(([id]) => id);
  assert.deepEqual(holders.toSorted(), [
    "people_counting_dwelling",
    "vehicle_counting_dwelling",
  ]);
});

test("the stay limit is off by default and bounded", () => {
  const spec = ANALYTIC_PARAM_SPECS.people_counting_dwelling.find(
    (item) => item.key === "max_stay_seconds",
  );
  assert.equal(spec.kind, "integer");
  assert.equal(spec.fallback, 0);
  assert.equal(paramError(spec, 0), null);
  assert.equal(paramError(spec, 1_000_000_000), null);
  assert.equal(paramError(spec, -1), "At least 0.");
  assert.equal(paramError(spec, 1_000_000_001), "At most 1000000000.");
  assert.equal(paramError(spec, 1.5), "Use a whole number.");
});

test("the stay limit field says that 0 turns it off", () => {
  assert.equal(paramLabel("max_stay_seconds"), "Max stay in seconds (0 = off)");
  assert.equal(paramLabel("max_people"), "Max people");
});
