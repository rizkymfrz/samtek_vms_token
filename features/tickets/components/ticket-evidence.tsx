"use client";
import { CameraIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MAX_EVIDENCE_PER_TICKET } from "../schemas/ticket";
import type { TicketEvidence as Evidence } from "../types";

export const TicketEvidence = ({
  evidence,
  renderPhoto,
  canUpload,
  isUploading,
  onUpload,
}: {
  evidence: Evidence[];
  renderPhoto: (id: string) => ReactNode;
  canUpload: boolean;
  isUploading: boolean;
  onUpload: (file: File) => void;
}) => {
  const input = useRef<HTMLInputElement>(null);
  const isFull = evidence.length >= MAX_EVIDENCE_PER_TICKET;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">
          Photos ({evidence.length}/{MAX_EVIDENCE_PER_TICKET})
        </span>
        {canUpload && (
          <>
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) onUpload(file);
              }}
            />
            <Button
              variant="secondary"
              disabled={isUploading || isFull}
              onClick={() => input.current?.click()}
            >
              <CameraIcon />
              {isUploading ? "Uploading…" : "Add photo"}
            </Button>
          </>
        )}
      </div>
      {evidence.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No photos yet. Closing a ticket needs at least one.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {evidence.map((photo) => (
            <li key={photo.id}>{renderPhoto(photo.id)}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
