export const ANALYTICS = [
  {
    id: "people_counting_dwelling",
    label: "People counting and dwelling",
  },
  {
    id: "vehicle_counting_dwelling",
    label: "Vehicle counting and dwelling",
  },
  {
    id: "ppe_violation",
    label: "PPE violation",
  },
  {
    id: "ppe_violation_advance",
    label: "PPE violation advance",
  },
  {
    id: "fire_smoke",
    label: "Fire and smoke detection",
  },
  {
    id: "people_crowd_monitoring",
    label: "People crowd monitoring",
  },
  {
    id: "people_worker_dwelling",
    label: "People worker dwelling",
  },
  {
    id: "cat_detection",
    label: "Cat detection alarm",
  },
  {
    id: "phone_calling",
    label: "Phone calling",
  },
  {
    id: "people_sleep_on_duty",
    label: "People sleep on duty",
  },
  {
    id: "motion",
    label: "Motion detection",
  },
  {
    id: "speed_violation",
    label: "Speed violation",
  },
  {
    id: "dust_spreading",
    label: "Dust spreading",
  },
  {
    id: "face_recognition",
    label: "Face recognition",
  },
  {
    id: "face_visitor_attendance",
    label: "Face visitor attendance",
  },
  {
    id: "face_attribute",
    label: "Face attribute",
  },
  {
    id: "license_plate_recognition",
    label: "License plate recognition",
  },
  {
    id: "vehicle_license_plate_recognition",
    label: "Vehicle license plate recognition",
  },
  {
    id: "people_reidentification",
    label: "People re-identification",
  },
  {
    id: "people_pose",
    label: "People pose",
  },
] as const;

export const analyticLabel = (id: string) =>
  ANALYTICS.find((a) => a.id === id)?.label ?? id;
