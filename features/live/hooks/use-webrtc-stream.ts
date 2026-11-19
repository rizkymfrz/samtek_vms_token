"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { pickRelayUrl } from "../lib/relay-url";
import { requestAnswer } from "../services/webrtc-signaling";

export type PlayerStatus =
  "connecting" | "playing" | "reconnecting" | "unavailable";

const ICE_WAIT_MS = 2000;
const FIRST_FRAME_MS = 8000;
const STALL_MS = 4000;
const SEAMLESS_STALL_MS = 1500;
const RETRY_FIRST_MS = 1000;
const RETRY_MS = 2000;
const WATCH_MS = 500;
const FRAME_TIME_LIMIT = 4000;

export const isFrameTimeSupported = () =>
  typeof RTCRtpScriptTransform !== "undefined";

const iceComplete = (session: RTCPeerConnection) =>
  new Promise<void>((resolve) => {
    if (session.iceGatheringState === "complete") return resolve();
    session.onicegatheringstatechange = () => {
      if (session.iceGatheringState === "complete") resolve();
    };
    setTimeout(resolve, ICE_WAIT_MS);
  });

export const useWebrtcStream = (
  relay: { webrtcUrl: string | null; webrtcUrlLocal: string | null },
  stream: string,
  app = "live",
  isSeamless = false,
  isPaused = false,
  withAudio = false,
  onAudio?: (hasAudio: boolean) => void,
  isTimed = false,
) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameTimes = useRef(new Map<number, number>());
  const frameTimeOf = useCallback(
    (rtp: number) => frameTimes.current.get(rtp) ?? null,
    [],
  );
  const onAudioRef = useRef(onAudio);
  useEffect(() => {
    onAudioRef.current = onAudio;
  }, [onAudio]);
  const isPausedRef = useRef(isPaused);
  const resumeRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("connecting");
  const { webrtcUrl, webrtcUrlLocal } = relay;
  const stallMs = isSeamless ? SEAMLESS_STALL_MS : STALL_MS;
  const retryFirstMs = isSeamless ? 0 : RETRY_FIRST_MS;
  useEffect(() => {
    const wasPaused = isPausedRef.current;
    isPausedRef.current = isPaused;
    if (wasPaused && !isPaused) resumeRef.current?.();
  }, [isPaused]);
  useEffect(() => {
    const video = videoRef.current;
    const baseUrl = pickRelayUrl(
      { webrtcUrl, webrtcUrlLocal },
      window.location,
    );
    if (!video || !baseUrl) {
      setStatus("unavailable");
      return;
    }
    setStatus("connecting");
    const abort = new AbortController();
    let session: RTCPeerConnection | null = null;
    let watcher: ReturnType<typeof setInterval> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let isLost = false;
    let lastMove = performance.now();
    let hasFrame = false;
    let timer: Worker | null = null;
    const close = () => {
      timer?.terminate();
      timer = null;
      frameTimes.current.clear();
      clearInterval(watcher);
      session?.close();
      session = null;
      onAudioRef.current?.(false);
    };
    const retry = () => {
      close();
      if (abort.signal.aborted) return;
      if (isPausedRef.current) {
        isLost = true;
        return;
      }
      setStatus("reconnecting");
      retryTimer = setTimeout(connect, attempt === 0 ? retryFirstMs : RETRY_MS);
      attempt += 1;
    };
    const resume = () => {
      if (abort.signal.aborted) return;
      if (session?.connectionState === "connected" && !isLost) {
        lastMove = performance.now();
        hasFrame = false;
        return;
      }
      clearTimeout(retryTimer);
      attempt = 0;
      isLost = false;
      setStatus("reconnecting");
      void connect();
    };
    const watch = (current: RTCPeerConnection) => {
      let decoded = 0;
      lastMove = performance.now();
      hasFrame = false;
      watcher = setInterval(async () => {
        if (session !== current || isPausedRef.current) return;
        (await current.getStats()).forEach((report) => {
          if (report.type !== "inbound-rtp" || report.kind !== "video") return;
          if (report.framesDecoded > decoded) {
            decoded = report.framesDecoded;
            lastMove = performance.now();
            hasFrame = true;
            attempt = 0;
            setStatus("playing");
          }
          const idle = performance.now() - lastMove;
          if (idle > (hasFrame ? stallMs : FIRST_FRAME_MS)) retry();
        });
      }, WATCH_MS);
    };
    const connect = async () => {
      close();
      if (isPausedRef.current) {
        isLost = true;
        return;
      }
      const current = new RTCPeerConnection();
      session = current;
      const videoTransceiver = current.addTransceiver("video", {
        direction: "recvonly",
      });
      if (isTimed && isFrameTimeSupported()) {
        const worker = new Worker(
          new URL("../workers/frame-time-worker.ts", import.meta.url),
          { type: "module" },
        );
        worker.onmessage = ({
          data,
        }: MessageEvent<{ rtp: number; wallMs: number }>) => {
          const times = frameTimes.current;
          times.set(data.rtp, data.wallMs);
          if (times.size > FRAME_TIME_LIMIT) {
            const oldest = times.keys().next().value;
            if (oldest !== undefined) times.delete(oldest);
          }
        };
        videoTransceiver.receiver.transform = new RTCRtpScriptTransform(
          worker,
          {},
        );
        timer = worker;
      }
      if (withAudio) current.addTransceiver("audio", { direction: "recvonly" });
      current.ontrack = (event) => {
        if (event.track.kind === "audio") onAudioRef.current?.(true);
        video!.srcObject = event.streams[0] ?? new MediaStream([event.track]);
      };
      current.onconnectionstatechange = () => {
        const state = current.connectionState;
        if (session === current && (state === "failed" || state === "closed"))
          retry();
      };
      try {
        await current.setLocalDescription(await current.createOffer());
        await iceComplete(current);
        if (session !== current) return;
        const sdp = await requestAnswer(
          baseUrl!,
          app,
          stream,
          current.localDescription!.sdp,
          abort.signal,
        );
        if (session !== current) return;
        await current.setRemoteDescription({ type: "answer", sdp });
      } catch (error) {
        if (attempt === 0) console.warn(`[webrtc] ${stream}:`, error);
        if (session === current) retry();
        return;
      }
      watch(current);
    };
    resumeRef.current = resume;
    void connect();
    return () => {
      resumeRef.current = null;
      abort.abort();
      clearTimeout(retryTimer);
      close();
      video.srcObject = null;
    };
  }, [
    webrtcUrl,
    webrtcUrlLocal,
    app,
    stream,
    stallMs,
    retryFirstMs,
    withAudio,
    isTimed,
  ]);
  return { videoRef, status, frameTimeOf };
};
