"use client";
import { Volume2Icon, VolumeXIcon } from "lucide-react";
import { ToolbarToggle } from "@/components/shared/toolbar-toggle";
import { useAudioFocus } from "../hooks/use-audio-focus";
import { setAudioActive } from "../lib/audio-focus";

export const SpeakerToggle = ({ audioId }: { audioId: string }) => {
  const { activeId, available } = useAudioFocus();
  if (!available.has(audioId)) return null;
  const isOn = activeId === audioId;
  return (
    <ToolbarToggle
      pressed={isOn}
      onPressedChange={(pressed) => setAudioActive(audioId, pressed)}
      label={isOn ? "Mute speaker" : "Unmute speaker"}
    >
      {isOn ? <Volume2Icon /> : <VolumeXIcon />}
    </ToolbarToggle>
  );
};
