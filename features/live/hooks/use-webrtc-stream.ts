"use client";
import { useEffect, useRef, useState } from "react";
import { pickRelayUrl } from "../lib/relay-url";
import { requestAnswer } from "../services/webrtc-signaling";

export type PlayerStatus =
  "connecting" | "playing" | "reconnecting" | "unavailable";

const ICE_WAIT_MS = 2000;
const FIRST_FRAME_MS = 8000;
const STALL_MS = 4000;
const RETRY_FIRST_MS = 1000;
const RETRY_MS = 2000;
const WATCH_MS = 500;

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
) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<PlayerStatus>("connecting");
  const { webrtcUrl, webrtcUrlLocal } = relay;
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
    const close = () => {
      clearInterval(watcher);
      session?.close();
      session = null;
    };
    const retry = () => {
      close();
      if (abort.signal.aborted) return;
      setStatus("reconnecting");
      retryTimer = setTimeout(
        connect,
        attempt === 0 ? RETRY_FIRST_MS : RETRY_MS,
      );
      attempt += 1;
    };
    const watch = (current: RTCPeerConnection) => {
      let decoded = 0;
      let lastMove = performance.now();
      let hasFrame = false;
      watcher = setInterval(async () => {
        if (session !== current) return;
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
          if (idle > (hasFrame ? STALL_MS : FIRST_FRAME_MS)) retry();
        });
      }, WATCH_MS);
    };
    const connect = async () => {
      close();
      const current = new RTCPeerConnection();
      session = current;
      current.addTransceiver("video", { direction: "recvonly" });
      current.ontrack = (event) => {
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
    void connect();
    return () => {
      abort.abort();
      clearTimeout(retryTimer);
      close();
      video.srcObject = null;
    };
  }, [webrtcUrl, webrtcUrlLocal, stream]);
  return { videoRef, status };
};
