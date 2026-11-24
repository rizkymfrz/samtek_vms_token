import { GlobeIcon } from "lucide-react";
import Link from "next/link";
import { ToolbarToggle } from "@/components/shared/toolbar-toggle";

export const CameraWebToggle = ({ id }: { id: string }) => {
  return (
    <ToolbarToggle
      pressed={false}
      label="Open camera web page"
      nativeButton={false}
      render={<Link href={`/cameras/${id}/web`} />}
    >
      <GlobeIcon />
    </ToolbarToggle>
  );
};
