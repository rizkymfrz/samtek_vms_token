"use client";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const CopyButton = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Button variant="ghost" size="icon-xs" onClick={copy} aria-label={label}>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
};
