import { GlobeIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const CameraWebToggle = ({ id }: { id: string }) => {
  return (
    <Button
      variant="secondary"
      size="icon-sm"
      aria-label="Open camera web page"
      title="Open camera web page"
      nativeButton={false}
      render={<Link href={`/cameras/${id}/web`} />}
    >
      <GlobeIcon />
    </Button>
  );
};
