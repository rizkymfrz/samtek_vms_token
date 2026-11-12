import type { FloorplanDevice } from "../types";

export const DEFAULT_FOV = 90;
export const FOV_OPTIONS = [60, 90, 120, 180];
const MIN = 0.02;
const MAX = 0.98;
export const clamp = (value: number) => Math.min(MAX, Math.max(MIN, value));

export const normalizeAngle = (degrees: number) =>
  ((Math.round(degrees) % 360) + 360) % 360;

const CANDIDATES: [number, number][] = [
  [0.5, 0.5],
  [0.4, 0.5],
  [0.6, 0.5],
  [0.5, 0.4],
  [0.5, 0.6],
  [0.3, 0.4],
  [0.7, 0.4],
  [0.3, 0.6],
  [0.7, 0.6],
  [0.2, 0.5],
  [0.8, 0.5],
];

const SPACING = 0.06;

export const placementId = (floorplanId: string, deviceRecordId: string) =>
  `${floorplanId}:${deviceRecordId}`;

export const placeCamera = (
  placements: FloorplanDevice[],
  floorplanId: string,
  deviceRecordId: string,
): FloorplanDevice[] => {
  const here = placements.filter((p) => p.floorplanId === floorplanId);
  if (here.some((p) => p.deviceRecordId === deviceRecordId)) return placements;
  const free =
    CANDIDATES.find(([x, y]) =>
      here.every((p) => Math.hypot(p.x - x, p.y - y) >= SPACING),
    ) ?? CANDIDATES[0];
  return [
    ...placements,
    {
      id: placementId(floorplanId, deviceRecordId),
      floorplanId,
      deviceRecordId,
      x: free[0],
      y: free[1],
      rotation: 0,
      fieldOfView: DEFAULT_FOV,
    },
  ];
};

const update = (
  placements: FloorplanDevice[],
  id: string,
  patch: Partial<FloorplanDevice>,
) => placements.map((p) => (p.id === id ? { ...p, ...patch } : p));

export const moveCamera = (
  placements: FloorplanDevice[],
  id: string,
  x: number,
  y: number,
) => update(placements, id, { x: clamp(x), y: clamp(y) });

export const rotateCamera = (
  placements: FloorplanDevice[],
  id: string,
  degrees: number,
) => update(placements, id, { rotation: normalizeAngle(degrees) });

export const setFov = (
  placements: FloorplanDevice[],
  id: string,
  fieldOfView: number,
) => update(placements, id, { fieldOfView });

export const removeCamera = (placements: FloorplanDevice[], id: string) =>
  placements.filter((p) => p.id !== id);

export const coneGeometry = (
  cx: number,
  cy: number,
  rotation: number,
  fieldOfView: number,
  range: number,
): string => {
  const point = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return [cx + range * Math.sin(radians), cy - range * Math.cos(radians)].map(
      (n) => Math.round(n * 100) / 100,
    );
  };
  const [x1, y1] = point(rotation - fieldOfView / 2);
  const [x2, y2] = point(rotation + fieldOfView / 2);
  if (fieldOfView >= 360)
    return `M ${cx} ${cy} m ${-range} 0 a ${range} ${range} 0 1 0 ${range * 2} 0 a ${range} ${range} 0 1 0 ${-range * 2} 0 Z`;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${range} ${range} 0 ${fieldOfView > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
};

export const pointToPlan = (
  clientX: number,
  clientY: number,
  box: { left: number; top: number; width: number; height: number },
) => {
  if (box.width === 0 || box.height === 0) return { x: 0.5, y: 0.5 };
  return {
    x: clamp((clientX - box.left) / box.width),
    y: clamp((clientY - box.top) / box.height),
  };
};

export const groupScope = (
  groups: { id: string; parentId: string | null }[],
  rootId: string,
) => {
  const scope = new Set([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const group of groups) {
      if (group.parentId && scope.has(group.parentId) && !scope.has(group.id)) {
        scope.add(group.id);
        grew = true;
      }
    }
  }
  return scope;
};
