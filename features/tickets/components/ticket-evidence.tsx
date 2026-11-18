"use client";
import { CameraIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MAX_EVIDENCE_PER_TICKET } from "../schemas/ticket";
import type { TicketEvidence as Evidence } from "../types";

const VISIBLE_PHOTOS = 3;

export const TicketEvidence = ({
  evidence,
  renderPhoto,
  canUpload,
  isUploading,
  onUpload,
  isCameraOnly = false,
}: {
  evidence: Evidence[];
  renderPhoto: (id: string) => ReactNode;
  canUpload: boolean;
  isUploading: boolean;
  onUpload: (file: File) => void;
  isCameraOnly?: boolean;
}) => {
  const input = useRef<HTMLInputElement>(null);
  const isFull = evidence.length >= MAX_EVIDENCE_PER_TICKET;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">
        Photos ({evidence.length}/{MAX_EVIDENCE_PER_TICKET})
      </span>
      {evidence.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No photos yet. Closing a ticket needs at least one.
        </p>
      ) : (
        <Carousel opts={{ align: "start" }}>
          <CarouselContent className="-ml-2">
            {evidence.map((photo) => (
              <CarouselItem key={photo.id} className="basis-1/3 pl-2">
                {renderPhoto(photo.id)}
              </CarouselItem>
            ))}
          </CarouselContent>
          {evidence.length > VISIBLE_PHOTOS && (
            <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>
          )}
        </Carousel>
      )}
      {canUpload && (
        <>
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            capture={isCameraOnly ? "environment" : undefined}
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
  );
};
