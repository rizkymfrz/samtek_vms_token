export const ANALYTICS = [
  {
    id: "people_counting_dwelling",
    label: "People counting and dwelling",
    camera: "Lobby Entrance",
    edge: "Main Building",
  },
  {
    id: "vehicle_counting_dwelling",
    label: "Vehicle counting and dwelling",
    camera: "Main Gate",
    edge: "Parking",
  },
  {
    id: "ppe_violation",
    label: "PPE violation",
    camera: "Warehouse Gate",
    edge: "Warehouse",
  },
  {
    id: "ppe_violation_advance",
    label: "PPE violation advance",
    camera: "Loading Dock",
    edge: "Warehouse",
  },
  {
    id: "fire_smoke",
    label: "Fire and smoke detection",
    camera: "Warehouse Roof",
    edge: "Warehouse",
  },
  {
    id: "people_crowd_monitoring",
    label: "People crowd monitoring",
    camera: "Main Hallway",
    edge: "Main Building",
  },
  {
    id: "people_worker_dwelling",
    label: "People worker dwelling",
    camera: "Assembly Line",
    edge: "Warehouse",
  },
  {
    id: "cat_detection",
    label: "Cat detection alarm",
    camera: "Garden",
    edge: "Main Building",
  },
  {
    id: "phone_calling",
    label: "Phone calling",
    camera: "Call Center",
    edge: "Main Building",
  },
  {
    id: "people_sleep_on_duty",
    label: "People sleep on duty",
    camera: "Security Post",
    edge: "Parking",
  },
  {
    id: "motion",
    label: "Motion detection",
    camera: "Back Alley",
    edge: "Parking",
  },
  {
    id: "dust_spreading",
    label: "Dust spreading",
    camera: "Cement Silo",
    edge: "Warehouse",
  },
  {
    id: "face_recognition",
    label: "Face recognition",
    camera: "Lobby Turnstile",
    edge: "Main Building",
  },
  {
    id: "face_visitor_attendance",
    label: "Face visitor attendance",
    camera: "Reception Desk",
    edge: "Main Building",
  },
  {
    id: "face_attribute",
    label: "Face attribute",
    camera: "Showroom",
    edge: "Main Building",
  },
  {
    id: "license_plate_recognition",
    label: "License plate recognition",
    camera: "Parking Lot A",
    edge: "Parking",
  },
  {
    id: "vehicle_license_plate_recognition",
    label: "Vehicle license plate recognition",
    camera: "Boom Gate",
    edge: "Parking",
  },
  {
    id: "people_reidentification",
    label: "People re-identification",
    camera: "Main Lobby",
    edge: "Main Building",
  },
  {
    id: "people_pose",
    label: "People pose",
    camera: "Main Hallway",
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
