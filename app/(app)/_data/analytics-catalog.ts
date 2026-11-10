export const ANALYTICS = [
  {
    id: "people_counting_dwelling",
    label: "People Counting and Dwelling",
    camera: "Lobby Entrance",
    edge: "Main Building",
  },
  {
    id: "vehicle_counting_dwelling",
    label: "Vehicle Counting and Dwelling",
    camera: "Main Gate",
    edge: "Parking",
  },
  {
    id: "ppe_violation",
    label: "PPE Violation",
    camera: "Warehouse Gate",
    edge: "Warehouse",
  },
  {
    id: "ppe_violation_advance",
    label: "PPE Violation Advance",
    camera: "Loading Dock",
    edge: "Warehouse",
  },
  {
    id: "fire_smoke",
    label: "Fire and Smoke Detection",
    camera: "Warehouse Roof",
    edge: "Warehouse",
  },
  {
    id: "people_crowd_monitoring",
    label: "People Crowd Monitoring",
    camera: "Main Hallway",
    edge: "Main Building",
  },
  {
    id: "people_worker_dwelling",
    label: "People Worker Dwelling",
    camera: "Assembly Line",
    edge: "Warehouse",
  },
  {
    id: "cat_detection",
    label: "Cat Detection Alert",
    camera: "Garden",
    edge: "Main Building",
  },
  {
    id: "phone_calling",
    label: "Phone Calling",
    camera: "Call Center",
    edge: "Main Building",
  },
  {
    id: "people_sleep_on_duty",
    label: "People Sleep On Duty",
    camera: "Security Post",
    edge: "Parking",
  },
  {
    id: "motion",
    label: "Motion Detection",
    camera: "Back Alley",
    edge: "Parking",
  },
  {
    id: "dust_spreading",
    label: "Dust Spreading",
    camera: "Cement Silo",
    edge: "Warehouse",
  },
  {
    id: "face_recognition",
    label: "Face Recognition",
    camera: "Lobby Turnstile",
    edge: "Main Building",
  },
  {
    id: "face_visitor_attendance",
    label: "Face Visitor Attendance",
    camera: "Reception Desk",
    edge: "Main Building",
  },
  {
    id: "face_attribute",
    label: "Face Attribute",
    camera: "Showroom",
    edge: "Main Building",
  },
  {
    id: "license_plate_recognition",
    label: "License Plate Recognition",
    camera: "Parking Lot A",
    edge: "Parking",
  },
  {
    id: "vehicle_license_plate_recognition",
    label: "Vehicle License Plate Recognition",
    camera: "Boom Gate",
    edge: "Parking",
  },
  {
    id: "people_reidentification",
    label: "People Re-Identification",
    camera: "Main Lobby",
    edge: "Main Building",
  },
] as const;

export const ANALYTIC_IDS: string[] = ANALYTICS.map((a) => a.id);

export const analyticLabel = (id: string) =>
  ANALYTICS.find((a) => a.id === id)?.label ?? id;

export const parseSelection = (
  raw: string | string[] | undefined,
): string[] => {
  if (raw === undefined) return ANALYTIC_IDS;
  const wanted = new Set(
    (Array.isArray(raw) ? raw.join(",") : raw).split(",").filter(Boolean),
  );
  return ANALYTIC_IDS.filter((id) => wanted.has(id));
};
