import type { FacesData } from "../types";

const EDGE = { id: "1", name: "Main Building" };

const face = (id: string, personId: string, name: string, group: string) => ({
  id,
  personId,
  name,
  group,
  hasPhoto: false,
  edgeId: EDGE.id,
  edgeName: EDGE.name,
});

export const buildFaces = (): FacesData => ({
  edges: [EDGE],
  failures: [],
  faces: [
    face("f1", "p1", "Budi Santoso", "staff"),
    face("f2", "p1", "Budi Santoso", "staff"),
    face("f3", "p2", "Sari Wulan", "staff"),
    face("f4", "p3", "Andi Pratama", "vip"),
    face("f5", "p4", "Rina Marlina", "visitor"),
    face("f6", "p5", "Dewi Lestari", "nogroup"),
  ],
});
