import {
  ActivityIcon,
  BedIcon,
  CarFrontIcon,
  CatIcon,
  ClockIcon,
  FlameIcon,
  HardHatIcon,
  type LucideIcon,
  ScanFaceIcon,
  ScanLineIcon,
  SmartphoneIcon,
  SmileIcon,
  UserCheckIcon,
  UsersIcon,
  UsersRoundIcon,
  WindIcon,
} from "lucide-react";

export type AnalyticGroup = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  analyticIds: string[];
};

export const ANALYTIC_GROUPS: AnalyticGroup[] = [
  {
    slug: "fire-smoke-detection",
    title: "Fire & Smoke Detection",
    description:
      "Automatically detects fire and smoke events from camera footage.",
    icon: FlameIcon,
    analyticIds: ["fire_smoke"],
  },
  {
    slug: "ppe-violation",
    title: "Personnel Protective Equipment (PPE)",
    description:
      "Identifies whether workers are wearing required safety gear such as helmets and vests.",
    icon: HardHatIcon,
    analyticIds: ["ppe_violation", "ppe_violation_advance"],
  },
  {
    slug: "people-counting-dwelling",
    title: "People Counting and Dwelling",
    description:
      "Counts people crossing a line or entering an area, and how long they stay.",
    icon: UsersIcon,
    analyticIds: ["people_counting_dwelling"],
  },
  {
    slug: "vehicle-counting-dwelling",
    title: "Vehicle Counting and Dwelling",
    description:
      "Counts vehicles passing through in real time, and how long they stay.",
    icon: CarFrontIcon,
    analyticIds: ["vehicle_counting_dwelling"],
  },
  {
    slug: "people-crowd-monitoring",
    title: "People Crowd Monitoring",
    description:
      "Raises an alarm when the number of people in an area exceeds its limit.",
    icon: UsersRoundIcon,
    analyticIds: ["people_crowd_monitoring"],
  },
  {
    slug: "people-worker-dwelling",
    title: "People Worker Dwelling",
    description:
      "Detects when a worker is absent from a post for an extended period.",
    icon: ClockIcon,
    analyticIds: ["people_worker_dwelling"],
  },
  {
    slug: "people-sleep-on-duty",
    title: "People Sleep On Duty",
    description: "Detects people who fall asleep while on duty.",
    icon: BedIcon,
    analyticIds: ["people_sleep_on_duty"],
  },
  {
    slug: "phone-calling",
    title: "Phone Calling",
    description: "Detects people using a phone in restricted areas.",
    icon: SmartphoneIcon,
    analyticIds: ["phone_calling"],
  },
  {
    slug: "face-recognition",
    title: "Face Recognition",
    description:
      "Recognizes and matches faces for identification and verification.",
    icon: ScanFaceIcon,
    analyticIds: ["face_recognition"],
  },
  {
    slug: "face-visitor-attendance",
    title: "Face Visitor Attendance",
    description:
      "Registers unknown faces as visitors and records how often they return.",
    icon: UserCheckIcon,
    analyticIds: ["face_visitor_attendance"],
  },
  {
    slug: "face-attribute",
    title: "Face Attribute",
    description:
      "Reads gender, age group, mask, glasses and emotion from detected faces.",
    icon: SmileIcon,
    analyticIds: ["face_attribute"],
  },
  {
    slug: "license-plate-recognition",
    title: "License Plate Recognition",
    description:
      "Captures and reads vehicle license plate numbers automatically.",
    icon: ScanLineIcon,
    analyticIds: [
      "license_plate_recognition",
      "vehicle_license_plate_recognition",
    ],
  },
  {
    slug: "motion-detection",
    title: "Motion Detection",
    description: "Detects movement inside the areas drawn on a camera.",
    icon: ActivityIcon,
    analyticIds: ["motion"],
  },
  {
    slug: "dust-spreading",
    title: "Dust Spreading",
    description: "Detects dust clouds and how far they spread.",
    icon: WindIcon,
    analyticIds: ["dust_spreading"],
  },
  {
    slug: "cat-detection",
    title: "Cat Detection Alert",
    description: "Detects cats in the monitored area.",
    icon: CatIcon,
    analyticIds: ["cat_detection"],
  },
];

export const findAnalyticGroup = (slug: string) =>
  ANALYTIC_GROUPS.find((group) => group.slug === slug);
