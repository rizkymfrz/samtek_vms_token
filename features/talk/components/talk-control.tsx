"use client";
import { HandIcon, MicIcon, PhoneOffIcon } from "lucide-react";
import { useEffect } from "react";
import { ToolbarToggle } from "@/components/shared/toolbar-toggle";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useTalkSupported } from "@/features/edge-status";
import { useTalk } from "../hooks/use-talk";
import { isLive, TALK_IDLE, type TalkSession } from "../lib/talk-session";
import { getTalk, setTalkHeld, startTalk, stopTalk } from "../lib/talk-store";

export const TalkControl = ({
  edgeId,
  deviceId,
}: {
  edgeId: string;
  deviceId: string;
}) => {
  const talk = useTalk();
  const isSupported = useTalkSupported()(edgeId, deviceId);
  const { data: user } = useCurrentUser();
  const isMine = talk.edgeId === edgeId && talk.deviceId === deviceId;
  const session: TalkSession = isMine ? talk.session : TALK_IDLE;
  const isBusyElsewhere = isLive(talk.session) && !isMine;
  const isActive = session.phase === "active";
  useEffect(
    () => () => {
      const current = getTalk();
      if (current.edgeId === edgeId && current.deviceId === deviceId) {
        void stopTalk();
      }
    },
    [edgeId, deviceId],
  );
  if (!isSupported && session.phase === "idle") return null;
  return (
    <>
      {isLive(session) && (
        <ToolbarToggle
          pressed={talk.isHeld}
          disabled={!isActive}
          onPointerDown={() => setTalkHeld(true)}
          onPointerUp={() => setTalkHeld(false)}
          onPointerLeave={() => setTalkHeld(false)}
          label="Hold to speak"
        >
          <HandIcon />
        </ToolbarToggle>
      )}
      {isLive(session) ? (
        <Button
          variant="destructive"
          size="icon-sm"
          data-talk="live"
          aria-label="Stop talk"
          title="Stop talk"
          onClick={() => void stopTalk()}
        >
          <PhoneOffIcon />
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Talk"
          title="Talk"
          disabled={!isSupported || !user || isBusyElsewhere}
          onClick={() => {
            if (user) void startTalk(edgeId, deviceId, user.id);
          }}
        >
          <MicIcon />
        </Button>
      )}
    </>
  );
};
