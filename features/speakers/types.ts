export type ApplyError = {
  code: string;
  field: string | null;
  message: string;
};

export type SpeakerRecord = {
  id: string;
  edgeServerId: string;
  name: string;
  isEnabled: boolean;
  host: string;
  port: number;
  username: string | null;
  hasPassword: boolean;
  timeoutSeconds: number;
  volume: number;
  applyStatus: "applied" | "rejected" | null;
  applyError: ApplyError | null;
  createdAt: string;
};

export type ServerOption = { id: string; name: string };
export type SpeakerFailure = { source: string; message: string };

export type SpeakersData = {
  speakers: SpeakerRecord[];
  servers: ServerOption[];
  failures: SpeakerFailure[];
};

export type SpeakerAudio = {
  id: string;
  edgeId: string;
  edgeName: string;
  name: string;
  format: string;
  bytes: number;
};

export type SpeakerAudioData = {
  audios: SpeakerAudio[];
  failures: { edgeName: string; message: string }[];
};

export type SpeakerCall = {
  id: string;
  edgeId: string;
  edgeName: string;
  occurredAt: string;
  source: string;
  deviceId: string | null;
  speakerId: string | null;
  eventId: string | null;
  kind: string | null;
  label: string | null;
  status: string;
  reason: string | null;
  durationMs: number;
};

export type SpeakerCallsData = {
  calls: SpeakerCall[];
  failures: { edgeName: string; message: string }[];
};
