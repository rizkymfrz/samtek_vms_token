import type { ParamSpec } from "@/features/edge-status";
import type { ParamValue } from "@/lib/api/analytic-params";

const spec = (
  key: string,
  kind: ParamSpec["kind"],
  fallback: ParamValue | null,
  extra: Partial<ParamSpec> = {},
): ParamSpec => ({
  key,
  kind,
  options: [],
  min: null,
  max: null,
  fallback,
  ...extra,
});

const sensitivity = (fallback: number) =>
  spec("sensitivity", "range", fallback, { min: 0, max: 100 });

const time = (key: string, fallback: string) => spec(key, "time", fallback);

const list = (key: string, options: string[], fallback: string[] = options) =>
  spec(key, "list", fallback, { options });

const flag = (key: string, fallback: boolean) => spec(key, "boolean", fallback);

const counting = [
  time("counting_start", "00:00:00"),
  time("counting_end", "23:59:59"),
];

const face = [
  sensitivity(50),
  flag("recognized_alarm", true),
  flag("stranger_alarm", false),
  spec("whitelist_groups", "list", []),
  time("start_time", "00:00:00"),
  time("end_time", "00:00:00"),
];

export const ANALYTIC_PARAM_SPECS: Record<string, ParamSpec[]> = {
  people_counting_dwelling: [
    ...counting,
    list("labels", ["person"]),
    sensitivity(0),
  ],
  vehicle_counting_dwelling: [
    ...counting,
    list("labels", ["bus", "car", "motorbike", "truck"]),
    sensitivity(0),
  ],
  ppe_violation: [
    list("required_items", ["helmet", "vest", "mask"]),
    sensitivity(50),
  ],
  ppe_violation_advance: [
    spec("required_items", "list", ["helmet", "glasses", "vest", "shoes"], {
      options: ["helmet", "glasses", "vest", "wearpack", "shoes"],
    }),
    sensitivity(50),
  ],
  fire_smoke: [list("labels", ["fire", "smoke"]), sensitivity(50)],
  people_crowd_monitoring: [
    list("labels", ["person"]),
    sensitivity(0),
    spec("max_people", "integer", 100, { min: 1, max: 100000 }),
    ...counting,
  ],
  people_worker_dwelling: [
    list("labels", ["person"]),
    sensitivity(0),
    spec("absent_after_seconds", "number", 4, { min: 0, max: 3600 }),
    spec("max_absent_seconds", "integer", 0, { min: 0, max: 86400 }),
  ],
  cat_detection: [sensitivity(30)],
  phone_calling: [sensitivity(80)],
  people_sleep_on_duty: [sensitivity(80)],
  face_recognition: face,
  face_visitor_attendance: face,
  face_attribute: [sensitivity(50)],
  license_plate_recognition: [],
  vehicle_license_plate_recognition: [],
  people_reidentification: [sensitivity(0)],
  motion: [
    sensitivity(50),
    time("motion_start", "00:00:00"),
    time("motion_end", "23:59:59"),
  ],
  dust_spreading: [sensitivity(50)],
};
