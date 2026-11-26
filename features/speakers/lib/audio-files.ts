import { AUDIO_MAX_BYTES } from "../schemas/audio";

export const AUDIO_ACCEPT = ".wav,.mp3,audio/wav,audio/mpeg";

export const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export const audioFileProblem = (file: File | null) => {
  if (!file) return "Choose an audio file.";
  if (!/\.(wav|mp3)$/i.test(file.name)) return "Use a WAV or MP3 file.";
  if (file.size === 0) return "The file is empty.";
  if (file.size > AUDIO_MAX_BYTES) return "The file is larger than 5 MB.";
  return null;
};
