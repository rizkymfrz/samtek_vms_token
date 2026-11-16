import { pcm16ToFloat, SAMPLE_RATE } from "./talk-protocol";

const LEAD_S = 0.15;
const MAX_QUEUE_S = 0.6;

export type PcmPlayer = {
  push: (pcm: Int16Array) => void;
  stop: () => void;
};

export const startPcmPlayer = (): PcmPlayer => {
  const context = new AudioContext({ sampleRate: SAMPLE_RATE });
  void context.resume();
  let nextTime = 0;
  return {
    push: (pcm) => {
      const now = context.currentTime;
      if (nextTime < now + 0.02) nextTime = now + LEAD_S;
      if (nextTime - now > MAX_QUEUE_S) nextTime = now + LEAD_S;
      const buffer = context.createBuffer(1, pcm.length, SAMPLE_RATE);
      buffer.copyToChannel(pcm16ToFloat(pcm), 0);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(nextTime);
      nextTime += buffer.duration;
    },
    stop: () => void context.close(),
  };
};
