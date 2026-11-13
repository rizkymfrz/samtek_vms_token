export { EdgeStatusConnector } from "./components/edge-status-connector";
export { StreamDetections } from "./components/stream-detections";
export { useDetections } from "./hooks/use-detections";
export { useRecognitions } from "./hooks/use-recognitions";
export type { RecognitionEntry } from "./lib/recognition-store";

export {
  useAnalyticCatalog,
  useEdgeRecording,
  useEdgeStatus,
  useRecordingDevice,
  useServerOnline,
} from "./hooks/use-edge-status";

export type {
  AnalyticDescriptor,
  DetectionObject,
  EdgeEntry,
  EdgeRecording,
  EdgeSample,
  EdgeSeries,
  ParamKind,
  ParamSpec,
  PlaybackSession,
  RecordingDevice,
  RecordingRange,
  RecordingState,
  RecordingStream,
} from "./types";

export {
  type EdgeEvent,
  subscribeEdgeEvents,
  subscribeEdgeReconnect,
} from "./lib/edge-event-bus";

export type {
  EdgeAlarmMessage,
  EdgeClipMessage,
  EdgeRecognitionMessage,
} from "./schemas/edge-message";

export { sendEdgeCommand } from "./lib/edge-status-store";

export {
  controlPlayback,
  startClipPlayback,
  startPlayback,
  stopPlayback,
} from "./lib/playback-commands";

export { queryRecording } from "./lib/recording-query";
