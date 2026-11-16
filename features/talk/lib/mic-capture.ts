import { Chunker, floatToPcm16, Resampler, silentChunk } from "./talk-protocol";

const WORKLET_URL = "/worklets/talk-capture.js";

export type MicCapture = {
  stop: () => void;
};

export const startMicCapture = async (handlers: {
  isMuted: () => boolean;
  onChunk: (pcm: Int16Array) => void;
  onEnded: () => void;
}): Promise<MicCapture> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("The microphone needs HTTPS or localhost.");
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  const context = new AudioContext();
  try {
    await context.audioWorklet.addModule(WORKLET_URL);
    await context.resume();
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    void context.close();
    throw error;
  }
  for (const track of stream.getAudioTracks()) {
    track.onended = handlers.onEnded;
  }
  const source = context.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(context, "talk-capture");
  const sink = context.createGain();
  sink.gain.value = 0;
  const resampler = new Resampler(context.sampleRate);
  const chunker = new Chunker();
  node.port.onmessage = (event: MessageEvent<Float32Array>) => {
    const pcm = floatToPcm16(resampler.push(event.data));
    for (const chunk of chunker.push(pcm)) {
      const muted = handlers.isMuted();
      handlers.onChunk(muted ? silentChunk(chunk.length) : chunk);
    }
  };
  source.connect(node).connect(sink).connect(context.destination);
  return {
    stop: () => {
      node.port.onmessage = null;
      stream.getAudioTracks().forEach((track) => (track.onended = null));
      source.disconnect();
      node.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      void context.close();
    },
  };
};
