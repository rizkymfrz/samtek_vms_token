import { SettingsIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const CameraDetailToggle = ({
  id,
  tab,
}: {
  id: string;
  tab: "configuration" | "playback";
}) => {
  return (
    <Button
      variant="secondary"
      size="icon-sm"
      aria-label="Open camera detail"
      title="Open camera detail"
      nativeButton={false}
      render={<Link href={`/cameras/${id}?tab=${tab}`} />}
    >
      <SettingsIcon />
    </Button>
  );
};
