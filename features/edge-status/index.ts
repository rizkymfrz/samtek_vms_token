export { EdgeStatusConnector } from "./components/edge-status-connector";
export { StreamDetections } from "./components/stream-detections";
export { useDetections } from "./hooks/use-detections";
export { useRecognitions } from "./hooks/use-recognitions";
export type { RecognitionEntry } from "./lib/recognition-store";

export {
  useAnalyticCatalog,
  useBodyworn,
  useDeviceFaulty,
  useEdgeRecording,
  useEdgeStatus,
  useRecordingDevice,
  useServerOnline,
  useTalkSupported,
} from "./hooks/use-edge-status";

export type {
  AnalyticDescriptor,
  BodywornState,
  DetectionObject,
  DetectionStatus,
  EdgeEntry,
  EdgeRecording,
  EdgeSample,
  EdgeSeries,
  ParamKind,
  ParamSpec,
  PlaybackSession,
  PtzPreset,
  RecordingDevice,
  RecordingRange,
  RecordingState,
  RecordingStream,
} from "./types";

export {
  type EdgeEvent,
  subscribeEdgeEvents,
  subscribeEdgeReconnect,
  subscribeEdgeTalk,
} from "./lib/edge-event-bus";

export { ulid } from "./lib/ulid";

export type {
  EdgeAlarmMessage,
  EdgeClipMessage,
  EdgeRecognitionMessage,
} from "./schemas/edge-message";

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
