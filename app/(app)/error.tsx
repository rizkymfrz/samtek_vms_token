"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const ErrorPage = ({ error, retry }: { error: unknown; retry: () => void }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex flex-col items-center gap-2 p-8 text-center">
      <p className="text-sm font-medium">This page couldn’t load</p>
      <p className="text-xs text-muted-foreground">
        A server or edge may be unreachable. Try again in a moment.
      </p>
      <Button size="sm" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
};

export default ErrorPage;
