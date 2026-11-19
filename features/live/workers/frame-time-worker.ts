import { parseFrameTime } from "../lib/frame-time-sei";

type EncodedFrame = {
  data: ArrayBuffer;
  getMetadata: () => { rtpTimestamp?: number };
};

type TransformEvent = {
  transformer: {
    readable: ReadableStream<EncodedFrame>;
    writable: WritableStream<EncodedFrame>;
  };
};

const scope = self as unknown as {
  onrtctransform: ((event: TransformEvent) => void) | null;
  postMessage: (message: { rtp: number; wallMs: number }) => void;
};

scope.onrtctransform = ({ transformer }) => {
  transformer.readable
    .pipeThrough(
      new TransformStream<EncodedFrame, EncodedFrame>({
        transform(frame, controller) {
          const rtp = frame.getMetadata().rtpTimestamp;
          const wallMs = parseFrameTime(new Uint8Array(frame.data));
          if (rtp !== undefined && wallMs !== null)
            scope.postMessage({ rtp, wallMs });
          controller.enqueue(frame);
        },
      }),
    )
    .pipeTo(transformer.writable)
    .catch(() => {});
};
