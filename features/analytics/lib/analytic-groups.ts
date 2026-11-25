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
import { analyticLabel } from "@/config/analytics-catalog";

export type AnalyticGroup = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  analyticIds: string[];
  recognizer?: string;
};

type GroupSource = Omit<AnalyticGroup, "title"> & { title?: string };

const GROUPS: GroupSource[] = [
  {
    slug: "fire-smoke-detection",
    description:
      "Automatically detects fire and smoke events from camera video.",
    icon: FlameIcon,
    analyticIds: ["fire_smoke"],
  },
  {
    slug: "ppe-violation",
    title: "Personal protective equipment (PPE)",
    description:
      "Identifies whether workers are wearing required safety gear such as helmets and vests.",
    icon: HardHatIcon,
    analyticIds: ["ppe_violation", "ppe_violation_advance"],
  },
  {
    slug: "people-counting-dwelling",
    description:
      "Counts people crossing a line or entering an area, and how long they stay.",
    icon: UsersIcon,
    analyticIds: ["people_counting_dwelling"],
  },
  {
    slug: "vehicle-counting-dwelling",
    description:
      "Counts vehicles passing through in real time, and how long they stay.",
    icon: CarFrontIcon,
    analyticIds: ["vehicle_counting_dwelling"],
  },
  {
    slug: "people-crowd-monitoring",
    description:
      "Raises an alarm when the number of people in an area exceeds its limit.",
    icon: UsersRoundIcon,
    analyticIds: ["people_crowd_monitoring"],
  },
  {
    slug: "people-worker-dwelling",
    description:
      "Detects when a worker is absent from a post for an extended period.",
    icon: ClockIcon,
    analyticIds: ["people_worker_dwelling"],
  },
  {
    slug: "people-sleep-on-duty",
    description: "Detects people who fall asleep while on duty.",
    icon: BedIcon,
    analyticIds: ["people_sleep_on_duty"],
  },
  {
    slug: "phone-calling",
    description:
      "Detects people on a phone call, with a hand held near the head.",
    icon: SmartphoneIcon,
    analyticIds: ["phone_calling"],
  },
  {
    slug: "face-recognition",
    description:
      "Recognizes and matches faces for identification and verification.",
    icon: ScanFaceIcon,
    analyticIds: ["face_recognition"],
    recognizer: "face_recognition",
  },
  {
    slug: "face-visitor-attendance",
    description:
      "Registers unknown faces as visitors and records how often they return.",
    icon: UserCheckIcon,
    analyticIds: ["face_visitor_attendance"],
  },
  {
    slug: "face-attribute",
    description:
      "Reads gender, age group, mask, glasses and emotion from detected faces.",
    icon: SmileIcon,
    analyticIds: ["face_attribute"],
  },
  {
    slug: "license-plate-recognition",
    title: "License plate recognition",
    description:
      "Captures and reads vehicle license plate numbers automatically.",
    icon: ScanLineIcon,
    analyticIds: [
      "license_plate_recognition",
      "vehicle_license_plate_recognition",
    ],
    recognizer: "license_plate_recognition,vehicle_license_plate_recognition",
  },
  {
    slug: "motion-detection",
    description: "Detects movement inside the areas drawn on a camera.",
    icon: ActivityIcon,
    analyticIds: ["motion"],
  },
  {
    slug: "dust-spreading",
    description: "Detects dust clouds and how far they spread.",
    icon: WindIcon,
    analyticIds: ["dust_spreading"],
  },
  {
    slug: "cat-detection",
    description: "Detects cats in the monitored area.",
    icon: CatIcon,
    analyticIds: ["cat_detection"],
  },
];

export const FACE_RECOGNITION_SLUG = "face-recognition";

export const findAnalyticGroup = (slug: string) =>
  ANALYTIC_GROUPS.find((group) => group.slug === slug);

export const PLATE_RECOGNITION_SLUG = "license-plate-recognition";

export const COUNTING_STATS_SLUGS = [
  "people-counting-dwelling",
  "vehicle-counting-dwelling",
];

export const ANALYTIC_GROUPS: AnalyticGroup[] = GROUPS.map((group) => ({
  ...group,
  title: group.title ?? analyticLabel(group.analyticIds[0]),
}));
