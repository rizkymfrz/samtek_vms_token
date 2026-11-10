"use client";
import { useEffect } from "react";
import { startEdgeStatus } from "../lib/edge-status-store";

export const EdgeStatusConnector = () => {
  useEffect(() => {
    startEdgeStatus();
  }, []);
  return null;
};
