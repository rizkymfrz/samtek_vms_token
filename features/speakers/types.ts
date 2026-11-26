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
