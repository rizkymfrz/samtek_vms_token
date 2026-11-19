import { edgeDownTopic } from "@/config/mqtt";
import {
  getEdgeStatus,
  sendEdgeAudio,
  sendEdgeCommand,
  subscribeEdgeStatus,
  subscribeEdgeTalk,
  ulid,
} from "@/features/edge-status";
import { type MicCapture, startMicCapture } from "./mic-capture";
import { type PcmPlayer, startPcmPlayer } from "./pcm-player";
import {
  createSessionId,
  decodeAudio,
  encodeAudio,
  isNewer,
  SeqCounter,
} from "./talk-protocol";
import { isLive, reduceTalk, TALK_IDLE, type TalkEvent } from "./talk-session";
import {
  talkAudioSchema,
  talkResultSchema,
  talkStateSchema,
} from "../schemas/talk-message";
import type { TalkSnapshot } from "../types";

const CONNECT_TIMEOUT_MS = 30_000;
const SEEN_LIMIT = 200;
const EMPTY_PEERS: ReadonlyMap<string, string> = new Map();

let snapshot: TalkSnapshot = {
  session: TALK_IDLE,
  edgeId: null,
  deviceId: null,
  isHeld: false,
  error: null,
  peers: EMPTY_PEERS,
};

const SERVER_SNAPSHOT = snapshot;
const listeners = new Set<() => void>();
const seen = new Set<string>();

let mic: MicCapture | null = null;
let player: PcmPlayer | null = null;
let connectTimer: number | null = null;
let txSeq = new SeqCounter();
let rxSeq: number | null = null;

let orphan: { edgeId: string; deviceId: string; sessionId: string } | null =
  null;

let isWired = false;

const emit = () => {
  for (const listener of listeners) listener();
};

const patch = (next: Partial<TalkSnapshot>) => {
  snapshot = { ...snapshot, ...next };
  emit();
};

const peerKey = (edgeId: string, deviceId: string) => `${edgeId}:${deviceId}`;

const isDuplicate = (messageId: string) => {
  if (seen.has(messageId)) return true;
  seen.add(messageId);
  if (seen.size > SEEN_LIMIT) {
    const oldest = seen.values().next().value;
    if (oldest !== undefined) seen.delete(oldest);
  }
  return false;
};

const sendStop = (edgeId: string, deviceId: string, sessionId: string) =>
  sendEdgeCommand(edgeDownTopic(edgeId), "talk.stop", {
    device_id: deviceId,
    session_id: sessionId,
  }).catch(() => {
    orphan = { edgeId, deviceId, sessionId };
  });

const release = () => {
  if (connectTimer !== null) window.clearTimeout(connectTimer);
  connectTimer = null;
  mic?.stop();
  mic = null;
  player?.stop();
  player = null;
  window.removeEventListener("pagehide", onPageHide);
};

const dispatch = (event: TalkEvent) => {
  const before = snapshot.session;
  const session = reduceTalk(before, event);
  if (session === before) return;
  patch({ session });
  if (session.phase === "ended") release();
  if (session.phase === "active") {
    if (connectTimer !== null) window.clearTimeout(connectTimer);
    connectTimer = null;
  }
};

const isMutedNow = () => !snapshot.isHeld;

const onChunk = (pcm: Int16Array) => {
  const { session, edgeId, deviceId } = snapshot;
  if (session.phase !== "active" || !edgeId || !deviceId) return;
  sendEdgeAudio(edgeDownTopic(edgeId), "talk.audio", {
    device_id: deviceId,
    session_id: session.sessionId,
    seq: txSeq.take(),
    audio: encodeAudio(pcm),
  });
};

const onPageHide = () => {
  const { session, edgeId, deviceId } = snapshot;
  if (edgeId && deviceId && "sessionId" in session) {
    void sendStop(edgeId, deviceId, session.sessionId);
  }
};

const setPeer = (
  edgeId: string,
  deviceId: string,
  sessionId: string | null,
) => {
  const key = peerKey(edgeId, deviceId);
  const peers = new Map(snapshot.peers);
  if (sessionId === null) {
    if (!peers.delete(key)) return;
  } else if (peers.get(key) === sessionId) return;
  else peers.set(key, sessionId);
  patch({ peers });
};

const receive = (edgeId: string, message: unknown) => {
  const state = talkStateSchema.safeParse(message);
  if (state.success) {
    if (isDuplicate(state.data.id)) return;
    const {
      device_id,
      session_id,
      state: next,
      reason,
      detail,
    } = state.data.data;
    const { session } = snapshot;
    const isOurs =
      snapshot.edgeId === edgeId &&
      snapshot.deviceId === device_id &&
      "sessionId" in session &&
      session.sessionId === session_id;
    if (isOurs) {
      if (next === "active")
        dispatch({ type: "active", sessionId: session_id });
      else if (reason) {
        dispatch({ type: "ended", sessionId: session_id, reason, detail });
      }
      return;
    }
    if (next === "active") setPeer(edgeId, device_id, session_id);
    else if (snapshot.peers.get(peerKey(edgeId, device_id)) === session_id) {
      setPeer(edgeId, device_id, null);
    }
    return;
  }
  const audio = talkAudioSchema.safeParse(message);
  if (!audio.success) return;
  const { device_id, session_id, seq, audio: payload } = audio.data.data;
  const { session } = snapshot;
  if (
    session.phase !== "active" ||
    snapshot.edgeId !== edgeId ||
    snapshot.deviceId !== device_id ||
    session.sessionId !== session_id ||
    !isNewer(rxSeq, seq)
  ) {
    return;
  }
  const pcm = decodeAudio(payload);
  if (!pcm) return;
  rxSeq = seq;
  player?.push(pcm);
};

const watchEdge = () => {
  const { isConnected, talk } = getEdgeStatus();
  if (isConnected && orphan) {
    const { edgeId, deviceId, sessionId } = orphan;
    orphan = null;
    void sendStop(edgeId, deviceId, sessionId);
  }
  const { session, edgeId, deviceId } = snapshot;
  if (!edgeId || !deviceId || !("sessionId" in session)) return;
  if (!isConnected) {
    orphan = { edgeId, deviceId, sessionId: session.sessionId };
    dispatch({ type: "local", reason: "connection_lost" });
  } else if (!talk.has(edgeId)) {
    dispatch({ type: "local", reason: "edge_offline" });
  }
};

const wire = () => {
  if (isWired) return;
  isWired = true;
  subscribeEdgeTalk(receive);
  subscribeEdgeStatus(watchEdge);
};

const failMessage = (error: unknown) => {
  const code =
    error instanceof Error && "code" in error ? String(error.code) : "";
  if (code === "unavailable") {
    return "The device cannot talk now: it is not running on this edge, or does not support talk.";
  }
  if (code === "invalid_field") return "The edge rejected the talk request.";
  return error instanceof Error ? error.message : "Could not start talk.";
};

export const startTalk = async (
  edgeId: string,
  deviceId: string,
  userId: string,
) => {
  wire();
  const { session } = snapshot;
  if (session.phase === "starting" || session.phase === "connecting") return;
  if (session.phase === "active") return;
  const sessionId = createSessionId(userId, ulid());
  txSeq = new SeqCounter();
  rxSeq = null;
  patch({
    session: reduceTalk(TALK_IDLE, { type: "start", sessionId }),
    edgeId,
    deviceId,
    error: null,
    isHeld: false,
  });
  let micHandle: MicCapture;
  try {
    micHandle = await startMicCapture({
      isMuted: isMutedNow,
      onChunk,
      onEnded: () => {
        patch({ error: "The microphone was disconnected." });
        void stopTalk();
      },
    });
  } catch (error) {
    patch({
      session: TALK_IDLE,
      error:
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone access was denied."
          : error instanceof Error
            ? error.message
            : "Could not open the microphone.",
    });
    return;
  }
  const current = snapshot.session;
  if (
    !isLive(current) ||
    !("sessionId" in current) ||
    current.sessionId !== sessionId
  ) {
    micHandle.stop();
    return;
  }
  mic = micHandle;
  player = startPcmPlayer();
  window.addEventListener("pagehide", onPageHide);
  try {
    const result = await sendEdgeCommand(edgeDownTopic(edgeId), "talk.start", {
      device_id: deviceId,
      session_id: sessionId,
    });
    const parsed = talkResultSchema.safeParse(result.talk);
    if (!parsed.success) throw new Error("The edge sent an unreadable answer");
    dispatch({ type: "result", sessionId, state: parsed.data.state });
    if (parsed.data.state === "connecting") {
      connectTimer = window.setTimeout(() => {
        dispatch({ type: "local", reason: "timeout" });
        void sendStop(edgeId, deviceId, sessionId);
      }, CONNECT_TIMEOUT_MS);
    }
  } catch (error) {
    dispatch({ type: "refused", sessionId, message: failMessage(error) });
  }
};

export const stopTalk = async () => {
  const { session, edgeId, deviceId } = snapshot;
  if (!edgeId || !deviceId || !("sessionId" in session)) return;
  const live = session.phase !== "ended";
  dispatch({ type: "local", reason: "stopped" });
  if (live) await sendStop(edgeId, deviceId, session.sessionId);
};

export const setTalkHeld = (isHeld: boolean) => patch({ isHeld });

export const subscribeTalk = (listener: () => void) => {
  wire();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getTalk = () => snapshot;
export const getServerTalk = () => SERVER_SNAPSHOT;
