import type { TalkSession } from "./lib/talk-session";

export type TalkSnapshot = {
  session: TalkSession;
  edgeId: string | null;
  deviceId: string | null;
  isHeld: boolean;
  error: string | null;
  errorTitle: string | null;
  peers: ReadonlyMap<string, string>;
};
