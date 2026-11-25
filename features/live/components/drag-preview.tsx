import { Thumbnail } from "./thumbnail";

export const DragPreview = ({ id, name }: { id: string; name: string }) => (
  <div className="relative aspect-video overflow-hidden border bg-sidebar shadow-lg">
    <Thumbnail id={id} />
    <span className="absolute bottom-1 left-1 max-w-[calc(100%-0.5rem)] truncate bg-background/70 px-1.5 py-0.5 text-xs backdrop-blur-md">
      {name}
    </span>
  </div>
);
