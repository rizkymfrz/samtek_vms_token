"use client";
import { useEffect } from "react";
import { toast } from "@/components/ui/toast";

export const useFailureToast = (
  title: string,
  messages: ReadonlyArray<string | null | undefined>,
) => {
  const description = messages.filter(Boolean).join(" · ");
  useEffect(() => {
    if (!description) return;
    const id = toast.add({ title, description, type: "error", timeout: 0 });
    return () => toast.close(id);
  }, [title, description]);
};
