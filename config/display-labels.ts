const humanize = (id: string) =>
  id.replace(/[_-]+/g, " ").replace(/^./, (char) => char.toUpperCase());

export const ALARM_KIND_LABEL: Record<string, string> = {
  area_dwell: "Dwelling alarm",
  ppe_missing: "PPE violation",
  fire_smoke_detected: "Fire and smoke alarm",
  crowd_limit_exceeded: "Crowd monitoring alarm",
  worker_absent: "Worker absent alarm",
  cat_detected: "Cat detection alarm",
  phone_call: "Phone calling alarm",
  sleep_on_duty: "Sleep alarm",
  motion_detected: "Motion alarm",
  speed_violation: "Speed violation alarm",
  dust_detected: "Dust detected",
  face_not_in_whitelist: "Outside whitelist",
  face_stranger: "Stranger",
};

export const RECOGNIZER_LABEL: Record<string, string> = {
  face_recognition: "Face recognition",
  face_visitor_attendance: "Face visitor attendance",
  license_plate_recognition: "License plate recognition",
  vehicle_license_plate_recognition: "Vehicle license plate recognition",
  people_reidentification: "People re-identification",
};

export const alarmKindLabel = (kind: string, fallbackTitle?: string) =>
  ALARM_KIND_LABEL[kind] ?? (fallbackTitle ? fallbackTitle : humanize(kind));

export const recognizerLabel = (id: string) =>
  RECOGNIZER_LABEL[id] ?? humanize(id);
