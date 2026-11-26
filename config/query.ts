export const LIVE_STALE_TIME_MS = 30_000;

export const QUERY_KEYS = {
  cameras: ["cameras"],
  servers: ["servers"],
  live: ["live"],
  layout: ["layout"],
  map: ["map"],
  floorplan: ["floorplan"],
  faces: ["faces"],
  users: ["users"],
  speakers: ["speakers"],
  speakerAudio: ["speaker-audio"],
  speakerCalls: ["speaker-calls"],
  license: ["license"],
  ticketServers: ["ticket-servers"],
  currentUser: ["current-user"],
} as const;
