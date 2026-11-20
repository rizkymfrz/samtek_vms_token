export { EdgeStatusConnector } from "./components/edge-status-connector";
export { StreamDetections } from "./components/stream-detections";
export { PlaybackBoxLayer } from "./components/playback-box-layer";
export { usePlaybackBoxes } from "./hooks/use-playback-boxes";

export {
  closePlaybackBoxes,
  resetPlaybackFrame,
} from "./lib/playback-box-store";

export { useRecognitions } from "./hooks/use-recognitions";
export type { RecognitionEntry } from "./lib/recognition-store";

export {
  useAnalyticCatalog,
  useBodyworn,
  useAllSearchIndex,
  useDeviceFaulty,
  useEdgeRecording,
  useEdgeSearchIndex,
  useEdgeStatus,
  useRecordingDevice,
  useServerOnline,
  useTalkSupported,
} from "./hooks/use-edge-status";

export type {
  BodywornState,
  EdgeEntry,
  EdgeRecording,
  ParamSpec,
  PlaybackSession,
  PtzPreset,
  RecordingRange,
  RecordingStream,
  SearchIndexStatus,
} from "./types";

export {
  type EdgeEvent,
  subscribeEdgeEvents,
  subscribeEdgeReconnect,
  subscribeEdgeTalk,
} from "./lib/edge-event-bus";

export { ulid } from "./lib/ulid";
export type { EdgeAlarmMessage, EdgeClipMessage } from "./schemas/edge-message";

export {
  getEdgeStatus,
  sendEdgeAudio,
  sendEdgeCommand,
  subscribeEdgeStatus,
} from "./lib/edge-status-store";

export {
  controlPlayback,
  startClipPlayback,
  startPlayback,
  stopPlayback,
} from "./lib/playback-commands";

export { queryRecording } from "./lib/recording-query";

export {
  callPtzPreset,
  deletePtzPreset,
  focusPtz,
  homePtz,
  listPtzPresets,
  movePtz,
  setPtzPreset,
  stopPtz,
} from "./lib/ptz-commands";
