import { kvGet, kvSet } from "./idb-kv";

const MAX_WIDTH = 640;
const QUALITY = 0.7;

export type Thumbnail = { blob: Blob; at: number };

const listeners = new Set<(id: string) => void>();
const keyOf = (id: string) => `thumbnail:${id}`;

export const loadThumbnail = async (id: string): Promise<Thumbnail | null> => {
  const value = await kvGet(keyOf(id));
  if (
    typeof value === "object" &&
    value !== null &&
    "blob" in value &&
    "at" in value &&
    value.blob instanceof Blob &&
    typeof value.at === "number"
  ) {
    return { blob: value.blob, at: value.at };
  }
  return null;
};

export const saveThumbnail = async (id: string, blob: Blob) => {
  await kvSet(keyOf(id), { blob, at: Date.now() });
  for (const listener of listeners) listener(id);
};

export const subscribeThumbnails = (listener: (id: string) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const captureFrame = (video: HTMLVideoElement) => {
  const { videoWidth: width, videoHeight: height } = video;
  if (!width || !height) return Promise.resolve(null);
  const scale = Math.min(1, MAX_WIDTH / width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
};
