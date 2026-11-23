import { webPrefix } from "../lib/web-target";

export const CameraWebFrame = ({ id, name }: { id: string; name: string }) => {
  return (
    <iframe
      title={`${name} web page`}
      src={`${webPrefix(id)}/`}
      className="block h-[calc(100svh-var(--header-height))] w-full bg-background"
    />
  );
};
